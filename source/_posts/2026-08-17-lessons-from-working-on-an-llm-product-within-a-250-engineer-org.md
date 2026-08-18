---
layout: post
title: "Lessons from working on an LLM product within a 250-engineer org"
kind: article
created_at: 2026-08-17 10:00 +0530
description: Product and engineering lessons from a year on a conversation quality analysis product, from LLM tracing and cost efficiency to the incentives that keep large teams effective
author: Yogiraj Hendre
table_of_contents: true
---

Conversation Quality Analysis (CQA), as the name suggests, is the process of analyzing the quality of a conversation. The process is employed by companies to analyze different types of conversations that happen between a support/sales agent and customers. Lately, this process has been automated with multi-modal LLMs, where an audio recording of a conversation or its transcript is fed into the LLM, while prompting it to analyze the conversation based on a pre-decided rubric. While the LLMs yield just an acceptable result, the sheer ability to analyze thousands of conversations at scale, while costing orders of magnitude less than what manual labour would cost, changed the economics of this a lot. Earlier, because a human was supposed to analyze the calls manually, calls needed to be sampled from the larger set, and only a fraction of calls could be analyzed. For almost a year, I was working on a project which did this LLM-assisted CQA, until I rolled off last week. The CQA project was a small 15-engineer pod working within a 250-engineer org. I have a few observations/lessons that I want to share, which I have separated into two parts: the first about LLM-assisted product development as a team, and the second about the product itself.


## Engineering

Like I mentioned earlier, I was part of a smaller pod within a 250-engineer org. We were all given Cursor subscriptions, which had pay-as-you-go billing. A few people across different pods had the USD 20 Claude Pro subscriptions, but they were provided on a case-by-case basis.

The codebase that I was working on was pilfered from an existing larger backend that encompassed the whole of the contact center system. From the beginning, people were using AI-assisted programming to develop the CQA application. Parts of the backend were almost completely written by AI, and the same was the case for the frontend. Around the six-month mark of my time, a few engineering leaders from the pod left, and soon there was a gradual erosion of the understanding of the system that the pod had collectively held before. I could sense the pod's growing detachment from the system, where not only the codebase, but even the behaviour of the system was not studied by individuals.

That is when I realized it's really necessary that:

### The leadership sets the right incentives for a collective understanding of the whole system

With LLM-assisted development, it is unavoidable that individual developers delegate away a portion of the understanding it takes to solve the problem they are tasked with. Often there is an incentive to let an agent loose, or to "move fast; break things". While this helps with velocity, where you add multiple new features in every sprint, it takes a significant toll on the collective lore that the team builds as a whole. This lore is what usually keeps expectations from drifting away from what is being built. With its loss, things start to break, the wrong set of features gets built, and the user experience of the product starts to deteriorate. I could see this happen in my pod, where the unknowing product manager, with the newfound confidence provided by Cursor, built an integration which ended up requiring hundreds of clicks to achieve a result that shouldn't have needed more than a few clicks.

This was accompanied by a growing cost burden of AI-assisted programming, where 250 engineers, initially incentivized by titles like 'Vibe Coder of the Month', started burning tokens at breakneck speed, and multiple payments of 10k USD had to be made every week to maintain development velocity. At some point, all the engineers had grown so accustomed to using AI that having Cursor blocked on payments brought the whole company's work to a complete standstill.

The 250 number was not just developers. It consisted of support engineers, quality analysts, and a few other engineering or engineering-adjacent roles. Many of these engineers were using the Atlassian MCP to fetch stories assigned to them, etc. The chief architect realized later that the MCP is quite inefficient and uses a disproportionately high number of tokens to carry out trivial tasks like fetching a card.

The final blow was when Cursor changed its pricing model, where all third-party models started being charged at API rates, which was prohibitively more expensive than the previous quota/request-based pricing. What made things worse was the complete lack of observability and the nonexistence of granular control over model selection in Cursor. The finance team had to resort to using a script to monitor individual developers' token usage and send them email reminders to switch to a cheaper/first-party model in Cursor.

That is when I realized that:

### Leadership needs to ensure people are token efficient while building systems

When you have a team of 250 people, most of them solving trivial problems or simple implementation tasks with LLMs, the tech debt is inevitably going to grow to an extent where only Opus-level models can work effectively. There are a lot of problems where LLM agents shine even when provided with ineffective context, but if a high number of developers in the team are bad at providing the appropriate yet succinct context, LLM-assisted development does not improve productivity in proportion to its costs. Which is why having small teams, with team-level subscriptions and AI budgets, while making the humans token efficient, is a priority.

## Product

While the leadership was dealing with cost challenges on the developer productivity front, our pod also got on the radar for having high LLM costs. As the whole CQA product is built around LLMs, this became a survival challenge for the pod, where we had to tame our LLM costs to avoid killing the product altogether.

While we were delivering features and improving user experience and analysis accuracy, we had overlooked the growing LLM costs. We were analyzing thousands of calls a day, and many of the calls, especially the tail end of very long calls, required multiple retries to generate a parseable output. What had happened is that when we were onboarding a high-volume client, we had introduced a very high limit on LLM retry attempts in the backend, which went unnoticed because of a changing of the guard.

We lacked observability, and the LLM service's cost logging logic had drifted a lot because of feature additions and optimizations to increase reliability. Soon, we were hit with a huge bill, where the costs did not make sense for the actual volume of calls we analyzed in a day.

That is when the EM decided to dedicate a pair of developers to introduce observability using Langfuse.

### Your LLM product needs traces and observability around LLM invocations

LLM tracing should be a priority. In my project, LLM logs and traces were initially considered unimportant, and were not given the first-class treatment they warrant. You can use Langfuse, Braintrust, or other tools, but whichever you choose, the raw trace data should be readily available. Once it is, traces also allow you to A/B test different configurations of your LLM setup, where you can unleash the maximum value out of cheaper models.

You must also use humans to annotate traces. Humans can detect and flag nuances in the audio recordings, and those nuances can be worked into prompts strategically to improve transcript quality.


### LLM context can help a lot with periodic enrichment of lore

Often packaged as self-improvement, this can be implemented as a feedback loop for the LLM: after generating a response, another LLM session suggests improvements to the data and its structure in the context provided earlier. For example, in a CQA-like system, the rubric used to analyze conversations can be iteratively made exhaustive to cover all the cases, gradually increasing the accuracy to near perfect.

### It's worth having a separate team to improve LLM generation while making it more cost efficient

Imbibing a cost-centric approach in the dev team should be of utmost priority, and again, tracing and cost tracking will help hugely in this effort. Although improvements in LLM reasoning may slow down, there will always be ways to make LLM generations as consistent and coherent as possible. To do this, you need a team to engineer the context that gets fed to the LLM; this team can implement the self-improvement loop I mentioned earlier.

While reasoning and generation accuracy is one axis, you can also iteratively reduce LLM costs by observing and optimizing what gets sent to the LLM, what gets generated, and what is cached. With exhaustive traces and the ability to A/B test, you can iterate quickly and choose the best way forward.
