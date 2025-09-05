---
title: My quarterly system health check-in beyond the dashboard
kind: article
author: Srihari Sriraman
created_at: 2025-09-05 00:00:00 UTC
layout: post
---
As a practice, it is essential to periodically take a few steps back from the day to day and reflect on where we are against our strategic goals. If you’re an engineering leader, a head of engineering, a director, or a VP, you likely have a recurring meeting to this effect.

In this post, I propose a structure for this operational exercise (complementing a business review) that lasts 2-4 hours, every month or quarter. I see quality as solving for the Pareto front with the tangible dimensions of reliability, performance, cost, delivery and security, and the more intangible dimensions of simplicity and social structures. For each dimension, go through the list of questions below and try to answer them together. The questions are:

- Intentionally informal to provoke honest discussion.
- Intuitive proxies for metrics. Numbers matter, and we should look at dashboards during discussions, but we need to go beyond the numbers and talk about the problems they represent.
- Intentionally *instinctive, and* *emotional*. They work by poking at symptoms, and leveraging the learned senses of trusted engineers, rather than breaking everything down to the raw facts. How they *feel* is an important signal, and it is a leader’s job to *listen* to them*.*
- Per system, where a system refers to a software service, or a group of them that you want to treat as a whole. I would suggest different review meets for systems, or teams you want to treat independently.
- Meant to be answered by people who actively work on the software every day
- About *effectiveness* at the [Pareto front](https://en.wikipedia.org/wiki/Pareto_front), not necessarily *efficiency*.
- Not novel. They’re what I hope most experienced developers would consider common sense.

---

## Simplicity

This is the most important dimension to reflect on quality. But it is best treated as an intangible dimension, and is hard to measure objectively. A simple system is performant, does one thing well, is cheap, and reliable. And a good engineer knows this intuitively.

1. What would a new engineer experience?
    - Can we explain the system’s responsibility in plain english, within 5 minutes?
    - Can they form a correct mental model in under one hour using only docs and diagrams?
    - Do we find ourselves apologising when explaining how the system works?
    - How long does it take for a new engineer to be onboarded? Is the time to first PR acceptable?
2. Is the domain simple? And Is the domain modelling simple?
    - What are its core domain entities ([aggregates](https://martinfowler.com/bliki/DDD_Aggregate.html)), and would you say there are many?
    - Is the current design made of small and composable components?
    - Do simple modifications you expect in hours, take many days? And is that surprising?
    - Are there Architecture Decision Records (ADRs) that you keep referring to for key decisions?
    - Does a small feature need modifications in many places, or in multiple modules?
    - Do users mostly figure out how to use, or build-on the system through its readme, and interfaces, or do we have to often answer questions around the usage?
3. Is it simple to observe, debug, and diagnose?
    - Do you need to look at values from the database or cache to diagnose most issues?
    - Can you reproduce bugs simply by making the same request again?
    - If the system is stateful, how is state represented? Is it simple to reconstruct the state at a given point in time?
4. Is the domain inherently complex, or is the software incidentally complex?
    - Are we afraid of making changes in this system because we might break things we don’t understand?
    - How often do we need to confer with the one person in the team who remembers why things are the way they are?
    - If we squash a bug, do two others take its place?
    - Given a chance to rewrite, what exactly would we change and why?

---

## Delivery

That is, delivery of business value, not code. It's faster to deliver newer and smaller software. As it gets older and larger, how do we maintain the speed? It’s mostly about the flywheel. How quickly do we get feedback, and how much of it do we get before going to production? 

1. Does it feel like we are moving slowly?
    - If so, what do you think makes us slow?
    - Are we happy with our deploy frequency, and rollback rate?
    - How much time does it take, on average, for a user-story (business value), to go from in-progress to done (in-production)? Has this been improving or deteriorating?
    - How confident are we about our estimates? Is our predictability improving? What’s our track record of sticking to estimated timelines?
2. How much confidence do we have in our tests, builds and deployments?
    - Do green builds on main automatically deploy to production?
    - Will we deploy during peak hours, or during Friday nights?
    - Can we refactor anything as long tests pass? What are we afraid of refactoring?
    - Do tests pass consistently on CI, and everyone’s machines?
    - What % of the codebase is abandoned, irrelevant, or barely used in production?
3. How good is our local setup?
    - Does everyone in the team run their service locally on their machine?
    - Do the service dependencies like databases, queues, caches etc also run locally? Are they in-memory so they’re faster?
    - How much time does it take to run tests locally?
    - How much time does it take to install dependencies and build a service locally?
    - Is the local setup a single command, and does it “just work”?
4. What’s the % split of feature / bug / chore (tech-task)?
    - Do we understand reasons for current split?
    - Does the split reflect our strategic focus?

---

## Reliability

This dimension is fairly well quantified, usually. So it’s possible to be objective, and look at the numbers for SLOs, uptime, etc and make meaningful judgements from it. However, I’ll still write out questions for the subjective / qualitative aspects that should be evaluated in addition to the objective ones (that I am not writing about).

1. Is our incident management healthy?
    - Do we ignore alerts because they’re noisy?
    - How many alerts do we receive or every week? Does it feel like we’re constantly fire fighting?
    - How many of those alerts were for previously diagnosed issues?
    - How often are incidents detected by users rather than alerts?
    - Which stage needs most attention? Detection, Triage, Diagnosis, Recovery, or Review?
    - Does a newcomer know what to do when they receive an alert?
2. Are our reliability expectations reasonable, and clear?
    - What are the critical user journeys supported by this system?
    - Do we have product-level SLOs for user journeys end-to-end that are well monitored?
    - Are the reliability issues due to essential or incidental complexity?
    - How can we get away with lesser reliability requirements?
    - Do we need to be transactionally, or eventually consistent? If eventually consistent, in how much time? Can that be relaxed for better reliability?
    - Do we feel like we’re re-inventing the wheel? Would using existing, or managed solutions be more reliable?
3. How much control do we have on our reliability?
    - How much are our systems dependent on external systems? Are they optional or required?
    - Are we happy with our timeouts, fallbacks, and defaults?
4. Fault isolation, graceful degradation, and automatic recovery.
    - When one system fails, do others fail? And is that failure cascade reasonable as per their domain responsibilities?
    - At loads over capacity, does the system continue to work at capacity?
    - What parts of recovery are manual?

---

## Performance

We just need to be performant enough to enable the next growth curve of the business. This section cares about that kind of performance. Effective, not efficient.

1. Are the performance expectations clear, and reasonable?
    - Does the workload or throughput actually match business metrics, or is it inflated incidentally? Reducing scale is the best way to deal with scale.
    - Are the performance expectations for the system clear? Are SLOs set beforehand?  Are they reasonable? Begin with the end in mind.
    - Is performance of the journey user-bound, or system-bound? If user-think-time dominates, performance of the system isn’t the most important concern.
2. Is the team truly aware of the current state?
    - Do people know (by memory) the approximate p99s of critical operations?
    - Does the team know the normal throughput patterns (morning and evening peaks for example) to know that something is amiss by just looking at the shape of throughput through time?
    - What are the normal and peak resource utilisations of the system? Do we have leading indicators of trouble, or just lagging ones?
    - Which components will require redesign before horizontal scaling is viable?
3. Do we know what direction to improve performance in?
    - Which resource is the bottleneck? Compute, memory, I/O, network, or something else?
    - Is the synchronous request path tight, with everything non-critical kicked to async tasks?
    - What kind of throughput disrupts performance? Unpredictable spikes and bursts, or more predictable plateaus and sawtooths?
    - What accuracy, or consistency requirements constrain performance?
    - Has optimisation created rigidity? Are we boxed into micro-optimizations that block larger design moves?

---

## Organisation

Software architecture is socio-technical. Organisation design, system design, and process design are deeply connected. How people are organised, and how they communicate, is [reflected in the software architecture](https://en.wikipedia.org/wiki/Conway%27s_law), and vice-versa. Yet, these aspects are often seen as independent, or unrelated.

In order to enable high ownership and agency, we should be willing to restructure teams or rescope responsibilities, just as much as we’re willing to change software architecture.

1. Is the team’s responsibility and ownership clear?
    - How dissonant is the product <> team <> system responsibility overlap?
    - If this system is responsible for a journey, does the team own the journey and funnel too?
    - Does the system fit into the boundaries of the team’s business domain?
2. Are we fighting against organisational structure with software structure?
    - What are the downstreams and upstreams of the system, and are they owned by teams that are close to this team in the org-chart?
    - What is the average number of people required to own a system, and what are the outliers (on both ends) to that?
    - Is the system responsible for many things?
    - Is the work-life balance for people different based on the systems they work on? Is that warranted?
3. Do our processes complement or contrast our architecture?
    - Do incentives reward short term velocity over long term manoeuvrability?
    - How many meetings could have been avoided if we had clear contracts?
    - Do users build on the system by composing and configuring, or do they need to collaborate and coordinate with us to get work done?
    - Which people have “meetings all day”, and is their time best spent that way? Does it compensating for poor system or org structure?
    - Which processes would we drop if we trusted everyone like we trust ourselves?
    - Is there a [CONTRIBUTING.md](http://contributing.md/) defined?
    - What is the average number of PRs open at any point in time?

## Cost, Security

These are important dimensions, and are very much part of the Pareto frontier. Unfortunately, I haven’t built a lot of intuitions with these dimensions. I understand them enough to work on related problems, but not enough to be writing a health check questionnaire on. I hope someone does this. It would be useful. 

Write in if you would like to collaborate on these sections with me!

---

The questions will make conversations happen, but it is up to you to truly listen, understand, and make the most of it. I would suggest using the meeting to focus on the problems. You can prioritise and solve for them later on.

Also, I’m also assuming you’re doing the work of ensuring the work is focused on the right problem to begin with. Climbing a ladder fast isn’t useful if it’s against the wrong wall. 

_ Thanks to Atharva for his thought review of this post. _
