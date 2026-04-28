---
layout: post
title: Business Failures Are Logical Outcomes, Not Exceptions
kind: article
created_at: 2026-04-24
description: When business outcomes are modelled as exceptions, workflows lose their shape. A better approach in Temporal is to treat them as data.
author: Priyanga P Kini
---

We recently worked on a document verification workflow for a logistics platform. The process involves users uploading identity documents. The system runs OCR on each document, validates the extracted fields, and marks the document as verified or rejected. We built this using [Temporal](https://temporal.io/), a workflow orchestration platform.

In the Temporal framework, the individual tasks are modelled as [**Activities**](https://docs.temporal.io/activities), and the orchestration logic as the [**Workflow**](https://docs.temporal.io/workflows).

![Document verification workflow](/images/blog/document-verification-workflow.png)

Temporal uses exceptions as its primary mechanism for handling failures, so we initially modelled our validation Activity the same way:

```kotlin
fun validateDocument(extractedData: ExtractedData): Boolean {
    if (extractedData.documentNumber == null) {
        throw ValidationException("Document number not found")
    }
    if (!isValidFormat(extractedData.documentNumber)) {
        throw ValidationException("Invalid document number format")
    }
    ...
    return true
}
```

The Workflow caught the exception to route the rejection:

```kotlin
override fun processDocument(document: Document) {
    try {
        val extractedData = activities.runOcr(document)
        activities.validateDocument(extractedData)
        markVerified(document.id)
    } catch (e: ActivityFailure) {
        markRejected(document.id, e.cause?.message)
    }
}
```

## Why is this a problem?

When an Activity throws an exception, Temporal treats it as a failure. The exception travels through Temporal's infrastructure and arrives at the Workflow wrapped in an `ActivityFailure`.

Temporal's [failure handling guidance](https://temporal.io/blog/failure-handling-in-practice) distinguishes between platform-level and application-level errors. You can mark an application-level error as [non-retryable](https://docs.temporal.io/references/failures#non-retryable) `ApplicationFailure` to skip retries, or flag it as [Benign](https://docs.temporal.io/develop/java/activities/benign-exceptions) to suppress metrics and log noise.

But the Workflow still receives a valid state transition as an `ActivityFailure` in a catch block. You can inspect the cause to distinguish a rejection from a crash, but both arrive as exceptions. The control flow treats them the same way: as interruptions.

## Why does this matter?

When you use exceptions for business logic, you tell the state machine that it has failed to reach any valid next state. This forces the orchestrator to handle the result as an interruption of the process rather than a continuation.

By modelling outcomes as data, you keep the happy path and alternative paths within the domain of state transitions. The `try/catch` block is then correctly relegated to handling actual infrastructure failures, such as a worker crashing or an API timing out.

## The fix

Instead of throwing an exception for a rejected document, we return the outcome as data. The result flows through Temporal's normal return path. No failure machinery is triggered.

We represent both success and rejection as explicit variants of a single return type:

```kotlin
sealed class ValidationResult {
    data class Verified(val data: VerifiedData) : ValidationResult()
    data class Rejected(val reason: String) : ValidationResult()
}

fun validateDocument(extractedData: ExtractedData): ValidationResult {
    if (extractedData.documentNumber == null) {
        return ValidationResult.Rejected("Document number not found")
    }
    if (!isValidFormat(extractedData.documentNumber)) {
        return ValidationResult.Rejected("Invalid document number format")
    }
    ...
    return ValidationResult.Verified(extractedData.toVerified())
}
```

The Workflow uses a `when` block instead of `try/catch`:

```kotlin
override fun processDocument(document: Document) {
    val extractedData = activities.runOcr(document)
    val result = activities.validateDocument(extractedData)
    when (result) {
        is ValidationResult.Verified -> markVerified(document.id)
        is ValidationResult.Rejected -> handleRejection(document.id, result.reason)
    }
}
```

The rejected document is no longer an interruption. It's a state the workflow transitions to.
