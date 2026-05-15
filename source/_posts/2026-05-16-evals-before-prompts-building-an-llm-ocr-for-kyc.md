---
layout: post
title: "Evals before prompts: building an LLM OCR for KYC"
kind: article
created_at: 2026-05-16 10:00 -0800
description: A year ago, I built an LLM-based pipeline to extract fields from PAN, Aadhaar, DL, and RC documents. The work that mattered most wasn't the prompts. It was the golden dataset, the rubric, and the loop I built around them. Here's how I set up evals for the project, and what I'd do differently today.
author: Priyanga P Kini
---

KYC, or Know Your Customer, is how banks, fintechs, and a growing number of businesses use to verify that a person is who they claim to be. At the heart of it sits a deeply unglamorous task: typing the fields off a scanned PAN card or Aadhaar into a form. Humans are bad at this. It's boring, error-prone, and, at scale, expensive. Can an LLM do it instead?

Around this time last year, I was trying to answer that question for one of our clients. They wanted to know whether LLMs could reduce the cost of document verification without sacrificing the accuracy KYC demands.

I started my POC by understanding the domain and gathering information on the types of documents to be processed and the fields to be extracted.

## The Golden Dataset

After reviewing the client's existing data, I selected the documents that had already been successfully verified and vetted by a domain expert. This became the **golden dataset**, a highly curated, human-verified collection of inputs and "ground truth" (ideal) outputs that served as the ultimate benchmark for evaluating AI/LLM performance. To begin, I kept this dataset to a slice that mirrored real production distribution. Starting here matters because it gives you the one number you can defend to the client: "on the kind of documents you actually send us, the system is right X% of the time." Anything fancier, like model comparisons, prompt tweaks, and regression checks, are downstream of having that baseline.

We were dealing with four document types: PAN (Permanent Account Number issued by the Indian Income Tax Department), Aadhaar (Indian National ID card), DL (Indian Driver's License), and RC (Vehicle Registration Certificate). Each has its own layout and failure modes, and a model can't transfer what it learned from one to another. A single blended accuracy number across all four would have buried the real problem: an LLM that reads one document type perfectly might fail on another. So I sliced the golden dataset by document type and treated each slice as a separate problem, giving each its own baseline and room to iterate.

I included all varieties of input, such as flatbed scans and phone photos, glare and skew, the long tail of state-wise DL and RC layouts, and documents with regional-language text alongside English. This kept each evaluation tractable while still reflecting real-world data sets.

How big should the golden dataset be? It needed to be big enough that the expert's verdict was representative of production, small enough that they'd actually review every run end-to-end. I settled on 50 documents per document type. That was enough to cover the realistic mix within each slice: different states, capture conditions, formats. Iteration was fast. I could review a full run in hours and do it again whenever I changed a prompt or swapped a model.

## The Rubric and the Loop

I started with human review because, for identity documents, no automated check catches what a trained eye does. When a scan is unreadable, LLMs don't say "I don't know". They hallucinate plausible-looking IDs: a 10-character string in the right AAAAA9999A shape, a 12-digit Aadhaar that passes the checksum, a name read into the father's name slot. Reviewing each extraction side by side with the source image, I could see the failure modes start to repeat: digit confusions and hallucinated values. These "whys" were the only thing that told me what to fix next.

One thing that's easy to skip and shouldn't be: the rubric. The rubric is half the dataset. "Did the LLM read this correctly?" is not a yes/no question even for a single PAN card. Before any review happened, I sat with the domain expert and pinned down, field by field, what counted as acceptable:

- ID numbers (PAN, Aadhaar, DL number, registration number): exact match, character for character. One wrong character is a failure, full stop. Format-valid hallucinations are the worst kind of failure and are flagged separately from honest misreads.
- Names: do we tolerate ANIL KUMAR vs Anil Kumar? Anil vs Anil Kumar (last name trimmed). Anik vs Anil (character confusion). Anil K vs Anil Kumar (abbreviation). Seshadri vs Sesadri (transliteration variance).
- Date of birth: normalised to a canonical format before comparison, so 01/04/1990 and 1990-04-01 aren't punished as different.
- Hallucinations vs omissions: a hallucinated field is always scored worse than a null or [unreadable]. The rubric says so explicitly, because in KYC, "I don't know" is recoverable and "here's a confident wrong answer" is not.

With the dataset, the rubric, and a reviewer in place, I had an eval loop. Run a prompt against all 50 documents in a slice, collect the extractions, score each one against the rubric, and walk away with two things: a number for that slice and a list of why each failure happened. The list, not the number, was what drove the next prompt change. Then run it again.

## Iterating on the Prompt

My first prompt was a one-liner. Something close to "Extract the following fields from this image." I picked PAN to start with, the simplest layout and fewest fields. I got that working, and only then moved on to Aadhaar, DL, and RC. Each document type ended up with its own dedicated prompt. Trying to write one prompt that handled all four well was a losing battle: the layouts, critical fields, and failure modes are too different. Treating them as four separate problems made each one tractable. From there, the iterations on each prompt fell into three rough phases.

**Phase 1: Structure**. The first round of changes had nothing to do with the documents. I separated system and user prompts so instructions and inputs weren't tangled. I pinned down the output schema explicitly instead of letting the model decide. I dropped the temperature close to zero. And I rewrote the instructions to be short and direct. Every "please" and "kindly" came out. These were the kinds of changes any prompt-engineering tutorial will tell you about, and they did real work, but they only got me partway.

**Phase 2: Domain context**. The next round was about teaching the model what it was looking at. A naked "extract the DL number" didn't help when the document had half a dozen numbers on it. "Indian Driving Licence numbers follow state-specific formats like KA-XX-YYYYNNNNNNN" did. I added similar context for each ID type. Aadhaar is exactly 12 digits; PAN follows AAAAA9999A, and so on. Supplemented the prompt with a few-shot examples drawn from the client's own annotations. This is also where I added validation logic outside the model: regex patterns and format checks that would catch a bad extraction before it reached the rubric. The model was now wrong less often, and when it was, the wrongness was easier to spot.

**Phase 3: Decomposition**. The change that mattered most was structural, not textual. Instead of using a single prompt to return all fields for a given document type, I split the extraction into multiple focused calls, one per field. The single-prompt version was juggling too much: layout, language, format, and field semantics, all at once, with errors in one field bleeding into others. Per-field calls were slower and more expensive, but each call was simple enough that the model stopped tripping over itself.

By the end of these iterations, the system reached 95% accuracy on the golden set while reducing costs to 10% of the third-party service's cost.

## What I'd Do Differently Today

Looking back a year later, three things would change.

I'd add chain-of-thought to the prompt. Asking the model to first describe what it sees in the document and then extract it would have caught many of the errors I was chasing through prompt rewrites.

I'd skip the per-field decomposition. Today's vision models are good enough to extract a whole ID document in a single call without fields bleeding into each other, and that workaround isn't worth the cost and latency anymore.

I'd also use an LLM-as-judge to speed up the iteration loop. Once the rubric and a couple of hundred labelled examples were in place, I could calibrate a judge to compare the golden dataset against each extraction, mark matches, and reason about failures. Then I'd only review the flagged ones. Instead of scanning every document to find the broken ones, the judge would filter for signal.

What I wouldn't change is starting with one document type, the 50-document fast loop, and the rubric-first approach. The golden dataset, the rubric, the evaluation loop. Those were load-bearing.
