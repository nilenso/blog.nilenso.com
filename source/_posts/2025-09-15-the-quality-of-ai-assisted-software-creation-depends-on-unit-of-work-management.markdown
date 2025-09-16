---
title: The quality of AI-assisted software depends on unit of work management
kind: article
author: Atharva Raykar
created_at: 2025-09-15 00:00:00 UTC
post_url: ai-assisted-unit-of-work-management
layout: post
---
AI-assisted programming is an emerging craft. When I was new to this craft, I was getting lousy results, despite the models being rather intelligent. Turns out the major bottleneck is providing the correct context and not intelligence.

A couple of months ago, I had written about what some of that looked like. I want to expand on it, in a time where more "agentic" harnesses like Claude Code and Codex are becoming increasingly popular.

Andrej Karpathy, while referencing that article, described the work of AI-assisted engineering as "putting AI on a tight leash". What does a tight leash look like for a process where AI agents are operating on your code more independently than ever? He dropped a hint—work on small chunks of a single concrete thing.

It is clear that the craft of AI-assisted software creation is ultimately about correctly managing units of work.

## Context Engineering is also important for creating software

I enjoy the term [context engineering](https://simonwillison.net/2023/Jan/23/riley-goodside/), because it has opened up the vocabulary to better describe why managing units of work is perhaps the most important technique to get better results out of AI tools. It centers our discussion around the main "canvas" against which our AI is generating code.

I like Anthropic's visualisation of the context window.

![](https://mintcdn.com/anthropic/PF_69UDRSEsLpN9D/images/context-window.svg?fit=max&auto=format&n=PF_69UDRSEsLpN9D&q=85&s=0e62b88b8d27b13a38dd2261151bada6)

The generated output of the LLM is a sample of the next token probability. Every time we generate a token, what has already been generated in the previous iteration is appended to the context window. What this context window looks like has a huge influence of the quality of your generated output.

Drew Breunig has [an excellent article](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html#context-distraction) on all kinds of things that often go wrong your context. I will summarise his descriptions:
* Context Poisoning is when a hallucination or other error makes it into the context, where it is repeatedly referenced.

Context rot / Context degradation benchmarks
Compaction tips from the claude code team (and other prominent people) that support this claim. also worth referencing dbreunig's post on types of context problems: clash, poisoning, confusion, distraction.

Task horizons from METR. 50% error rates etc.

Error propagations.

Therefore the important thing is to break it down to units of work.

What is the correct unit of work?

small.\
verifiable.\
provides business value.

Planning tools and modes keep an agent on rails and break down work into small chunks. With Kiro's specs, there's some verifiability.

But planning still operates starting from a large document or arc of what needs to be built. This can still be large enough to degrade the quality or the plan itself.

Planning needs to happen in the right level of detail. Hypothesis: deliverable business value is the right amount of detail. It is verifiable and if done correctly still fairly small.

Deliverable business value is also what all stakeholders can understand and work with. Software is not built in a vacuum by developers—it needs the coordination of teams, product owners, business people and users. The fact that AI agents work in their own context environment separate from the other stakeholders hurts effectiveness and transfer of its benefits.

<mention storymachine trying to test out this hypothesis, give a way to run the research preview>
