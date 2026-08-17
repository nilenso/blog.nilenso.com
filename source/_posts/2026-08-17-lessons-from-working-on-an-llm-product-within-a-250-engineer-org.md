---
layout: post
title: "Lessons from working on an LLM product within a 250-engineer org"
kind: article
created_at: 2026-08-17 10:00 +0530
description: Product and engineering lessons from a year on a conversation quality analysis product, from LLM tracing and cost efficiency to the incentives that keep large teams effective
author: Yogiraj Hendre
table_of_contents: true
---

After working for a year on a CQA (Conversation Quality Analysis) product, I rolled off last week. The CQA project was a small 15-engineer pod working within a 250-engineer org. I have a few lessons that I want to share, separated into two parts: the first about the product and LLMs, and the second about teams and LLM-assisted product development.

## Product

### Your LLM product needs traces and observability around LLM invocations

LLM tracing should be a priority. In my project, LLM logs and traces were often considered unimportant, and were not treated as the important artefacts they are. You can use Langfuse, Braintrust, or other tools, but whichever you choose, the raw trace data should be readily available. Once it is, traces also allow you to A/B test different configurations of your LLM setup, where you can unleash the maximum value out of cheaper models.

You must also use humans to annotate traces. Humans can detect and flag nuances in the audio recordings, and those nuances can be worked into prompts strategically to improve transcript quality.

### LLM context can help a lot with periodic enrichment of lore

Often packaged as self-improvement, this can be implemented as a feedback loop for the LLM: after generating a response, another LLM session suggests improvements to the data and its structure in the context provided earlier. For example, in a CQA-like system, the rubric used to analyse conversations can be iteratively made exhaustive to cover all the cases, gradually increasing the accuracy to near perfect.

### It's worth having a separate team to improve LLM generation while making it more cost efficient

Imbibing a cost-centric approach in the dev team should be of utmost priority, and again, tracing and cost tracking will help hugely in this effort. Although improvements in LLM reasoning may slow down, there will always be ways to make LLM generations as consistent and coherent as possible. To do this, you need a team to engineer the context that gets fed to the LLM; this team can implement the self-improvement loop I mentioned earlier.

While reasoning and generation accuracy is one axis, you can also iteratively reduce LLM costs by observing and optimising what gets sent to the LLM, what gets generated, and what is cached. With exhaustive traces and the ability to A/B test, you can iterate quickly and choose the best way forward.

## Engineering

### Leadership needs to set the right incentives for a collective understanding of the whole system

With LLM-assisted development, it is unavoidable that individual developers delegate away a core understanding of the problem they are tasked to solve. Often there is an incentive to let a system loose, or to "move fast; break things". While this helps with velocity, it takes a significant toll on the collective lore that the team builds as a whole. This lore is what keeps expectations from drifting from what is built.

### Leadership needs to ensure people are token efficient while building systems

When you have a team of 250 people, most of them solving trivial problems or simple implementation tasks with LLMs, the tech debt is inevitably going to grow to an extent where only Opus-level models can work effectively. There are a lot of problems where LLM agents shine even when provided with ineffective context, but if a disproportionately high number of developers are bad at providing the right context, LLM-assisted development does not improve productivity in proportion to its costs. Which is why having small teams, with team-level subscriptions and AI budgets, while making the humans token efficient, is a priority.
