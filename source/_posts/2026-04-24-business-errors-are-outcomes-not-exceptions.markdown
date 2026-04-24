---
layout: post
title: Business Errors Are Outcomes, Not Exceptions
kind: article
created_at: 2026-04-24
description: Not all failures are equal. Some indicate that the system couldn't complete its work. Others indicate that it did, and the answer just happens to be "no". In Temporal, this distinction becomes critical.
author: Priyanga P Kini
---

A document rejected during verification is not a system failure.

But it's easy to treat it like one.

The moment a validation fails, it's tempting to throw an exception and route it through the error path. This mixes two very different concerns: **system failures** and **business outcomes**.

A lesson from building onboarding workflows: not all failures are equal. Some indicate that the system couldn't complete its work. Others indicate that it did, and the answer just happens to be "no".

In systems built with [Temporal Cloud](https://temporal.io/), this distinction becomes critical.

When an [Activity](https://docs.temporal.io/activities) throws an exception, it doesn't just signal an error to the calling code. It triggers Temporal's retry and failure machinery. Activities are retried automatically, and if retries are exhausted, the [Workflow](https://docs.temporal.io/workflows) can be marked as failed.

That's exactly what you want when something actually breaks.

But when the outcome is a valid rejection, not a broken system, that machinery works against you.

## Modelling rejection as an exception

Consider a document verification flow: OCR, validation, and marking as verified or rejected. Our document verification Activity threw when validation failed:

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

And in the Workflow, we caught it to handle the rejection:

```kotlin
override fun processDocument(document: Document) {
    try {
        val ocrResult = activities.extractText(document)
        activities.validateDocument(ocrResult)
        markDocumentVerified(document.Id)
    } catch (e: ActivityFailure) {
        // This was our "rejection" path
        markDocumentRejected(document.Id, e.cause?.message)
    }
}
```

This is a common pattern, but not a good one. Using exceptions for control flow is a smell in any codebase. Temporal just makes the cost impossible to ignore. Before our `catch` block even runs, Temporal has already intercepted that exception. Depending on the retry policy, the Activity is retried. But a missing PAN number won't magically appear on the third attempt. The document is the same. The OCR output is the same. We're just burning through retries for nothing.

And we couldn't just catch the exception *before* Temporal sees it. That's not how the SDK works. The Activity runs on a worker, the exception travels through Temporal's infrastructure, and then arrives at the Workflow as an `ActivityFailure`. By that point, retries have already happened.

Worse, if retries are exhausted, the whole workflow gets marked as failed. Now imagine dozens of these. You open the Temporal dashboard and see a wall of red. Some are real problems. But most are just users uploading the wrong document. You can't tell them apart without clicking into each one.

**These aren't the same kind of failure**.

## The two buckets

Once you see it, it's obvious. There are really two different things going on:

**"Something broke"**: a worker crashed, an API timed out, the network blipped. The workflow didn't get a chance to do its job. This is exactly what Temporal's retry machinery is for. Retry the Activity, dispatch to another worker, try again.

**"The answer is no"**: a document failed validation, a field is missing, or KYC was rejected. Nothing is broken. The system did its job, and the answer just happens to be "this doesn't pass." That's not an error. It's an outcome.

When you throw exceptions for both, you're telling Temporal they're the same thing. They're not.

## Returning outcomes instead of throwing

We stopped throwing for business outcomes and started returning them:

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

Now the Workflow uses `when` instead of `try/catch`:

```kotlin
override fun processDocument(document: Document) {
    val ocrResult = activities.extractText(document)
    val outcome = activities.validateDocument(ocrResult)
    when (outcome) {
        is ValidationOutcome.Verified -> markDocumentVerified(document.Id)
        is ValidationOutcome.Rejected -> handleRejection(document.Id, outcome.reason)
    }
}
```

A rejected document doesn't kill the workflow. It routes to manual review, notifies the user, and waits for a re-upload. The workflow stays alive, doing what the business actually needs.

Exceptions are reserved for when things genuinely break, and Temporal handles those automatically.

## What changed

Once we made this change, a few things got better at once:

**The dashboard became useful.** A failed workflow now meant something was actually broken. No more sifting through noise to find real problems.

**Retries made sense.** Temporal only retried things that were worth retrying. Infrastructure hiccups got retried. Business rejections flowed through the domain logic.

**Debugging got easier.** The event history in Temporal's UI told a clean story: "Activity ran, returned a rejection". Instead of: "Activity failed, retried 3 times, all failed, workflow failed." Much easier to follow.
