---
layout: post
title: Business Failures Are Logical Outcomes, Not Exceptions
kind: article
created_at: 2026-04-24
description: Using exceptions for control flow is a well-known code smell. This applies in Temporal as much as anywhere else. Here's how we modelled business outcomes as data instead of exceptions in a document verification workflow.
author: Priyanga P Kini
---

## The Anti-Pattern: Control Flow by Exception

Using exceptions for control flow is a well-known code smell. When a function validates an input, a validation failure is an expected outcome. Modelling it as an exception conflates a logical branch with a system failure.

This applies in [Temporal](https://temporal.io/) as much as anywhere else. Temporal's failure model is exception-based by design, for good reasons: retries, recovery, and durability. But that doesn't mean every outcome should be an exception.

We recently worked on a user onboarding workflow for a logistics platform. The process involves users uploading identity documents, such as Government IDs. The system runs OCR on each document, validates the extracted fields, and marks the document as verified or rejected. We built this using Temporal.

In the Temporal framework, the individual tasks are modelled as [**Activities**](https://docs.temporal.io/activities), and the orchestration logic as the [**Workflow**](https://docs.temporal.io/workflows).

## The problem: Modelling logic errors as an exception

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

When an Activity throws an exception, Temporal treats it as a failure. The exception travels through Temporal's infrastructure and arrives at the Workflow wrapped in an `ActivityFailure`.

Temporal's [official guidance on failure handling](https://temporal.io/blog/failure-handling-in-practice) distinguishes between platform-level errors and application-level errors. You can mark an application-level error as [non-retryable](https://docs.temporal.io/references/failures#non-retryable) `ApplicationFailure` to skip retries, or flag it as [benign](https://docs.temporal.io/develop/java/activities/benign-exceptions) to suppress metrics and log noise. These tools solve the operational problems. But the Workflow still receives a business outcome as an `ActivityFailure` in a catch block. A rejected document is modelled the same way as a crashed worker.

When you use exceptions for business logic, you tell the state machine that it has failed to reach any valid next state. This forces the orchestrator to handle the result as an interruption of the process rather than a continuation.

By modelling outcomes as data, you keep the happy path and alternative paths within the domain of state transitions. The try/catch block is then correctly relegated to handling actual malfunctions in the machine itself, such as a worker crashing or an API timing out.

## The solution: Returning outcomes

Instead of throwing an exception for a rejected document, we return the outcome as data. The result flows through Temporal's normal return path. No failure machinery is triggered. The `when` block on a sealed class is exhaustive, so adding a new outcome forces you to handle it everywhere.

A sealed class represents both success and rejection as explicit outcomes:

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

The Workflow code reads as what it is: a logical branch, not error handling.
