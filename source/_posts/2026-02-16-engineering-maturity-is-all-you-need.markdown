---
title: Engineering Maturity is all you need
kind: article
author: Govind Krishna Joshi
created_at: 2026-02-16 00:00:00 UTC
layout: post
---
**8:PM in the evening: it's demo day tomorrow.** 

You've been fighting prompt the prompt for hours. 

You make the prompt more specific, but the bot fails where user gives an unexpected input. 

You loosen the constraints, and it starts hallucinating. 

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

## What is engineering maturity?

Engineering maturity is the practice of making decisions in the short term that enable a team to reliably deliver features in the long term.

Reliably means two things: The feature works as intended, and it is shipped within the estimated timelines. Teams that lack engineering maturity spend most of their time debugging, regressing, and re-doing work. They feel busy but don't make progress.

For AI applications specifically, engineering maturity means building the infrastructure that lets you **discover** what works because you cannot design your way to a working AI system.

## Discovery, not invention

This is the mental shift that matters most.

Traditional software engineering is largely deductive post product discovery. You gather requirements, design a system that meets them, implement the design, and verify it works. The gap between design and implementation is mostly determinable. If your design is sound and your implementation is correct, the system works.

AI engineering is empirical. You cannot deduce the right prompt from first principles. You cannot design the optimal tool schema on a whiteboard. You cannot predict how users will phrase requests or where the model will fail. You have to discover these things through structured experimentation.

This changes what "engineering maturity" means in practice:

* **Observability** isn't a production concern you'll add later. It's your instrument panel for discovery. Without it, you're experimenting in the dark.
* **Evals** aren't quality gates before release. They're the only way to know whether a change moved you forward, backward, or sideways.
* **Datasets** aren't training artifacts. They're the accumulated knowledge of what works and what doesn't. They are a core asset your team builds over time.

The teams that struggle in production are usually the ones who treated these as overhead during development. They optimized for speed to demo, not speed to reliable system. By the time they hit the wall, they've accumulated weeks of prompt changes with no systematic way to evaluate them.

## The maturity ladder

I'd like to use the following ladder as a framework to define what I mean by engineering maturity:

* **Level 0**: Prototype
* **Level 1**: Documented, repeatable processes
* **Level 2**: Specified, Tested, and Validated
* **Level 3**: Measured
* **Level 4**: Optimized

### Level 0 - Prototype

Level 0 is chaotic, ad-hoc, relies on individuals and tribal knowledge. This is where the protagonists in our initial story are at. There is no documentation, testing is mostly manual, deployments are run manually, and often a source of anxiety and errors, there is little explainability in the behavior of the application. Projects at this level are prototypes, even if they have production users. During prototyping you accumulate implicit knowledge and quality relies on your muscle memory of testing.

None of it transfers to production.

You can't A/B test based on vibes.\
You can't debug a regression using intuition.\
You can't onboard a new team member by transferring your gut feel.

### Level 1 - Documented, repeatable process

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

### Level 2 - Specified, Tested, and Validated

Level 2 is about defining the characteristics of the application.

**Testing**

AI applications are still software applications.

Unit tests, integration tests, end-to-end tests, all still important to know our applications are functioning as intended. While we await AGI, current day agents still have plenty of deterministic code that needs to work correctly. 

Test the deterministic parts: tool implementations, parsing logic, state management, API integrations. These should have conventional test coverage. This ensures that at least the deterministic parts of your AI application are error-free and safe from regression.

The fuzzy parts - model behavior, response quality - that's what evals are for. But a surprising number of production failures trace back to plain old software bugs in the scaffolding. Don't let the magic of LLMs distract you from the mundane discipline of testing the code around them.

**Evals**

Even though every component in motorsports vehicles is rigorously tested, teams spend countless hours doing track tests. Riders push to understand how the machine feels like when utilizing it to its limit.

Have you seen motogp riders give feedback?

*(Ref:* <https://www.youtube.com/watch?v=jsWv7K_V2Ss>)

That feedback is real, but it's useless on its own. Does "loose" mean the tire is overheating? Suspension too soft? Electronics cutting power too aggressively? The mechanic needs telemetry - tire temperature, suspension travel, lean angle, throttle position - to translate that vague feeling into actionable changes.

Evals are the telemetry for AI applications. 

A basic eval runs a suite of test inputs through your system and scores the outputs. Scores might be binary (pass/fail), numeric (0-100), or categorical (correct, partially correct, incorrect, harmful). Good evals check multiple dimensions and are defined along with the product team.

Start simple. A spreadsheet of test cases with expected behaviors, accumulating cases as you dog food the application. As you learn what "good" looks like, add automated scoring where possible and human review where necessary.

Evals serve two purposes:

* **They document discoveries the team makes.** Each eval case encodes something you learned - a failure mode you discovered, an edge case a user hit, a behavior you want to preserve. The eval suite is institutional memory.
* **Defining the product behavior.** A good eval suite is designed along with the product team and should measure aspects of how the users interact with the agent. Did the agent surface the correct information, is the agent too verbose, does the user interrupt often, etc. You want to improve [what matters to the users](https://blog.nilenso.com/blog/2024/12/24/good-enough-data/). 

### Level 3 - Measured

You can't improve what you don't measure. At level 3, you are measuring what matters. 

**Observability**

Knowing what our application is doing in production is the most important piece when it comes to understanding our applications. But "add logging" isn't enough. For AI applications, you need:

* **Structured logging of every LLM interaction.** The full input (including system prompt), the full output, latency, token counts, model version, temperature, and any other parameters, you need to be able to reproduce the interaction.
* **User-level distributed session tracing.** AI applications are asynchronous, distributed, and sometimes streaming in nature. You should have a trace of what happened, when, during a users session across all the distributed parts of the system.  
* **Alerts on regression.** Define metrics (latency p95, error rate, tool call success rate) and alert when they degrade. You don’t want your users telling you that the system is not working, or worse discovering it weeks later by going through logs or listening to recordings. 
* **Context Management.** Most critically, you need to see [what goes into the context window](https://github.com/nilenso/context-viewer). The context is everything - it's the only thing the model sees. When an agent misbehaves, the answer is almost always in the context: a previous tool call returned garbage, the conversation history accumulated contradictory instructions, or the system prompt got truncated. Without visibility into the actual context at each turn, you're debugging blind.

You cannot discover what works if you cannot see what's happening. This isn't optional infrastructure you'll add later. It's the foundation that makes everything else possible.

###Level 4 - Optimized

Level 4 unlocks our ability to systematically optimize and improve our AI applications

**Building a flywheel**

Production drift is the gap between your eval dataset and production reality. Real users often want to use agents in ways that are outside the evaluation distribution. Which makes the every interaction of the user with your application a valuable source of data. The mature AI team treats production as a continuous source of training and evaluation data.

This is the flywheel:

1. Deploy the system
2. Observe user interactions
3. Identify failures and successes
4. Add failures to eval suite (so you don't regress)
5. Add successes to example bank (so you can replicate)
6. Improve the system using this data
7. Repeat

The flywheel is the product—not in a business sense, but in an engineering sense. The mechanism that captures data, learns from it, and improves the system \*is\* the core technical asset. The prompt and the model are interchangeable. The flywheel is what compounds.

To build the flywheel, you need:

* Structured data capture (observability)
* Outcome tagging (success, failure, why)
* A growing eval suite
* A process for reviewing failures and improving the system

This is where the "engineering maturity is cheap" claim becomes concrete. The investment in observability and evals pays compound returns. Each production failure makes the system stronger - but only if you have the infrastructure to capture, categorize, and learn from it.

- - -

Engineering maturity is about building the harness that lets you tinker, experiment, and discover what works - at speed. Because in AI applications, iteration speed is everything. The techniques that work today will be obsolete next quarter. The model that was state-of-the-art last month is already surpassed.

You can't predict what will work. But you can build the system that lets you find that out faster.

Engineering maturity is all you need.
