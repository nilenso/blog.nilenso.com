---
layout: post
title: Business Errors Are Outcomes, Not Exceptions
kind: article
created_at: 2026-04-24
description: Not all failures are equal. Some indicate that the system couldn't complete its work. Others indicate that it did, and the answer just happens to be "no". In Temporal, this distinction becomes critical.
author: Priyanga P Kini
---

A document rejected during verification is not a system failure. But it's easy to treat it like one.

The moment a validation fails, it is tempting to throw an exception and route it through an error path. This mixes two different concerns: **system failures** and **business outcomes**.

When building workflows for processes like user onboarding, you learn that not all failures are equal. Some indicate the system could not complete its work. Others indicate that it did, and the answer was simply "no."

In systems built with [Temporal](https://temporal.io/), this distinction is critical.

## The Problem: Modelling rejection as an exception

When an [Activity](https://docs.temporal.io/activities) throws an exception, it triggers Temporal's retry and failure machinery. Activities are retried automatically. If retries are exhausted, the Workflow can be marked as failed. This is the correct behaviour for a broken system.

However, consider a document verification Activity:

```kotlin
fun validateDocument(ocrResult: OcrResult): Boolean {
    if (ocrResult.panNumber == null) {
        throw DocumentValidationException("PAN number not found")
    }
    if (!isValidPan(ocrResult.panNumber)) {
        throw DocumentValidationException("Invalid PAN number")
    }
    return true
}
```

In the Workflow, you might catch this to handle the rejection:

```kotlin
override fun processDocument(document: Document) {
    try {
        val ocrResult = activities.extractText(document)
        activities.validateDocument(ocrResult)
        markDocumentVerified(document.id)
    } catch (e: ActivityFailure) {
        // This was our "rejection" path
        markDocumentRejected(document.id, e.cause?.message)
    }
}
```

Using exceptions for control flow is a smell in any codebase, but Temporal makes the cost impossible to ignore. Before the catch block runs, Temporal intercepts that exception. Depending on the retry policy, the Activity is retried. A missing PAN number will not appear on the third attempt. The document and the OCR output remain the same. The system burns through retries for nothing.

Furthermore, you cannot `catch` the exception before Temporal sees it. The Activity runs on a worker, the exception travels through Temporal's infrastructure, and arrives at the Workflow as an `ActivityFailure` only after retries have occurred.

If retries are exhausted, the whole workflow is marked as failed. This creates a "wall of red" in the Temporal dashboard. You cannot distinguish between a real infrastructure problem and a user uploading the wrong document without clicking into each individual failure.

## The two buckets

Once you see it, it's obvious. There are two distinct categories of failure:

1. **"Something broke"**: A worker crashed, an API timed out, the network blipped. The workflow did not get a chance to do its job. This is what Temporal's retry machinery is for.
2. **"The answer is no"**: A document failed validation, a field is missing, or KYC was rejected. Nothing is broken. The system did its job, and the result was a rejection. This is a business outcome.

When you throw exceptions for both, you're telling Temporal they're the same thing. They're not.

## The Solution: Returning outcomes

Instead of throwing exceptions for business logic, return a result object.

```kotlin
sealed class ValidationOutcome {
    data class Verified(val extractedInfo: ExtractedInfo) : ValidationOutcome()
    data class Rejected(val reason: String) : ValidationOutcome()
}

fun validateDocument(ocrResult: OcrResult): ValidationOutcome {
    if (ocrResult.panNumber == null) {
        return ValidationOutcome.Rejected("PAN number not found")
    }
    if (!isValidPan(ocrResult.panNumber)) {
        return ValidationOutcome.Rejected("Invalid PAN number")
    }
    ...
    return ValidationOutcome.Verified(ocrResult)
}
```

The Workflow then uses a `when` block instead of a `try/catch`:

```kotlin
override fun processDocument(document: Document) {
    val ocrResult = activities.extractText(document)
    val outcome = activities.validateDocument(ocrResult)
    when (outcome) {
        is ValidationOutcome.Verified -> markDocumentVerified(document.id)
        is ValidationOutcome.Rejected -> handleRejection(document.id, outcome.reason)
    }
}
```

## What changed

After making this change, a few things improved:

**The dashboard became useful.** A failed workflow now meant something was actually broken. No more sifting through noise to find real problems.

**Retries made sense.** Temporal only retried things that were worth retrying. Infrastructure hiccups got retried. Business rejections flowed through the domain logic.

**Debugging got easier.** The event history in Temporal's UI told a clean story: "Activity ran, returned a rejection". This is much easier to follow than a sequence of failures and retries.

*Exceptions should be reserved for when things genuinely break. Business outcomes, even negative ones, should be handled as data.*
