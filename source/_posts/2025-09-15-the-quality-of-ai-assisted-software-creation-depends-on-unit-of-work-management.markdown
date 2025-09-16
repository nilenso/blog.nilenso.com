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

## The right sized unit of work respects the context

I enjoy the term [context engineering](https://simonwillison.net/2023/Jan/23/riley-goodside/), because it has opened up the vocabulary to better describe why managing units of work is perhaps the most important technique to get better results out of AI tools. It centers our discussion around the main "canvas" against which our AI is generating code.

I like Anthropic's visualisation of the context window.

![](https://mintcdn.com/anthropic/PF_69UDRSEsLpN9D/images/context-window.svg?fit=max&auto=format&n=PF_69UDRSEsLpN9D&q=85&s=0e62b88b8d27b13a38dd2261151bada6)

The generated output of the LLM is a sample of the next token probability. Every time we generate a token, what has already been generated in the previous iteration is appended to the context window. What this context window looks like has a huge influence of the quality of your generated output.

Drew Breunig has [an excellent article](https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html) on all kinds of things that often go wrong your context and the various techniques to fix them.

The best AI-assisted craftsmen are often thinking about the design and arrangement of their context to get the AI to one-shot a solution. This is tricky and effortful, contrary to what the AI coding hype suggests.

If you don't provide the necessary information in the context to do a good job, your AI will hallucinate or generate code that is not congruent with the practices of your codebase. Fill up the context with too much information, and [the quality of your output degrades](https://research.trychroma.com/context-rot), because of a lack of focused attention.

Breaking down your task to "right-sized" units of work, whose description has just the right level and detail of context is perhaps the most powerful lever to improve your context window, and thus the correctness and quality of the generated code.

## The right sized unit of work controls the propagation of errors

If per-action error rate is p and a task needs k actions, success ≈ (1-p)^k. Failure ≈ 1-(1-p)^k. With p=0.01, k=100 → 1-0.99^{100}\approx0.634

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
