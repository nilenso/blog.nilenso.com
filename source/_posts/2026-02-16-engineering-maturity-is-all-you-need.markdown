---
title: Engineering Maturity is all you need
kind: article
author: Govind Krishna Joshi
created_at: 2026-02-16 00:00:00 UTC
layout: post
---
![]()

**8:PM in the evening: it's demo day tomorrow.**

You've been fighting prompt the prompt for hours. 

You make the prompt more specific, but the bot fails where user gives an unexpected input. 

You loosen the constraints, and suddenly it starts hallucinating. 

Tool aren't being called reliably, users keep interrupting because they are unhappy with the response, and the interruptions exacerbate the bad responses. You make a change, and start testing manually. First use case - works; Second one - works, kind of; Third one - agent has regressed. 

*Sigh, restart the loop*

**11:00 AM next day: Time for the demo**

After many *you must*s and *you must not*s you've assembled a prompt that handles all the test cases. You've manually validated a them a few times. The prompt works, except once in a while. 

The demo goes well! The both handles all the use cases, makes most of the tools calls and manages interruptions reasonably well. 

Greenlit. Ship it to production! 🚀

Some shortcuts were taken to get here quickly, but that's fine, you'll fix it once live. 

**Pilot**

The agent is released to a 1000 users. There wasn't time to setup observability, so you are tailing the logs on the server, and looking at conversations in the database.

Some users are having an decent experience.\
Some that too repeat and clarify themselves, sometimes multiple times.\
Some are clearly frustrated. 

There are logs, but no observability.

You don't know why.\
You don't know how often.\
You don't know the contents of the context, or what tool calls were made preceding the failure.\
You have complaints, but no reproduction steps. 

*Heavy Sigh, restart the loop*

- - -

Language models are amazing. Today, we can build (semi-)autonomous agents that can reason on their own and perform side-effects in their environments. Building an application that leverages AI, can feel like magic when they work. 

But, it's confusing when they don't.

The probabilistic nature of the models bring unique challenges when using them to build applications. We are dealing with fuzzy inputs, fuzzy outputs, and even fuzzier set if steps to get there. Bitter lessons are learned, as techniques change quickly, some mastered over many iterations are surpassed by many magnitudes in performance by the release of a new model. 

I'd like to make a specific claim: **engineering maturity is the most important factor in building reliable AI applications.**  

Not model selection.\
Not prompt engineering tricks.\
Not the latest framework.

Traditional software practices like documentation, tests, observability, evals is what separates teams that ship from teams that demo.

### What is engineering maturity?

Engineering maturity is the practice of making decisions in the short term that enable a team to reliably deliver features in the long term.

Reliably means two things: The feature works as intended, and it is shipped within the estimated timelines. Teams that lack engineering maturity spend most of their time debugging, regressing, and re-doing work. They feel busy but don't make progress.

For AI applications specifically, engineering maturity means building the infrastructure that lets you **discover** what works because you cannot design your way to a working AI system.

### Discovery, not invention

This is the mental shift that matters most.

Traditional software engineering is largely deductive post product discovery. You gather requirements, design a system that meets them, implement the design, and verify it works. The gap between design and implementation is mostly determinable. If your design is sound and your implementation is correct, the system works.

AI engineering is empirical. You cannot deduce the right prompt from first principles. You cannot design the optimal tool schema on a whiteboard. You cannot predict how users will phrase requests or where the model will fail. You have to discover these things through structured experimentation.

This changes what "engineering maturity" means in practice:

* **Observability** isn't a production concern you'll add later. It's your instrument panel for discovery. Without it, you're experimenting in the dark.
* **Evals** aren't quality gates before release. They're the only way to know whether a change moved you forward, backward, or sideways.
* **Datasets** aren't training artifacts. They're the accumulated knowledge of what works and what doesn't. They are a core asset your team builds over time.

The teams that struggle in production are usually the ones who treated these as overhead during development. They optimized for speed to demo, not speed to reliable system. By the time they hit the wall, they've accumulated weeks of prompt changes with no systematic way to evaluate them.

### The maturity ladder

I'd like to use the following ladder as a framework to define what I mean by engineering maturity:

* **Level 0**: Prototypes
* **Level 1**: Documented, repeatable processes
* **Level 2**: Specified, Tested, Validated
* **Level 3**: Measured
* **Level 4**: Optimized

#### Level 0 - Prototypes

Level 0 is chaotic, ad-hoc, relies on individuals and tribal knowledge. This is where the protagonists in our initial story are at. There is no documentation, testing is mostly manual, deployments are run manually, and often a source of anxiety and errors, there is little explainability in the behavior of the application. Projects at this level are prototypes, even if they have production users. During prototyping you accumulate implicit knowledge and quality relies on your muscle memory of testing.

None of it transfers to production.

You can't A/B test based on vibes.\
You can't debug a regression using intuition.\
You can't onboard a new team member by transferring your gut feel.

#### Level 1 - Documented, repeatable process

At Level 1 you have good documentation, and your process are scripted and repeatable.

**Documentation**

In my opinion, good documentation is the second most important artifact that a software team produces, right after code.

A well-written PRD clarifies what you're building and why. A technical design doc captures architectural decisions and trade-offs. An ADR (Architecture Decision Record) explains why you chose approach A over B, so you don't re-litigate the decision in six months.

This documentation always been invaluable resources for teams of people. And now they have a new audience, coding agents. When you ask an AI to help implement a feature, good documentation is both the context and memory of the project it needs to generate good outputs. 

**CI/CD**

A clean bike is a fast bike. 

Motorsports is messy. Garages are loud, there is oil, grease, and hundreds of small rubber and metal bits all around. Yet, each time you see a vehicle leave the pit-lane at the start, it is clean. Being clean means, being reliable, being fast. It means that the process worked.

Production releases need the same rigor. 

You should deploy on every commit to trunk, automatically. You should never be afraid to deploy to production. You should have automated gates that prevent bad code from merging.



![A typical CI/CD pipeline](/images/blog/typical-ci-cd-pipeline.png "A typical CI/CD pipeline")

The goal is to make deployment boring.  

If deployment is a big event that requires coordination and courage, you'll deploy less often.\
If you deploy less often, you'll batch more changes together.\
If you batch changes, you can't isolate which change caused a regression.\
If you can't isolate changes, you can't learn from failures.

The whole discovery loop breaks down. It's impossible to iterate at the speed required for tinkering and experimenting without this foundation.
