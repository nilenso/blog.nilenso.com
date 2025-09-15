---
title: The quality of AI-assisted software creation depends on unit of work management
kind: article
author: Atharva Raykar
created_at: 2025-09-15 00:00:00 UTC
post_url: ai-assisted-unit-of-work-management
layout: post
---
Recap of the the AI assisted engineering post that Karpathy cited to bring up the point about keeping AI on a leash.

what's changed since:
there are now agents.

Context engineering opened up vocabulary to better describe how AI applications must be developed.

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
