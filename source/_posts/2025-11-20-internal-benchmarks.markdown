---
title: Internal Benchmarks
kind: article
author: Atharva Raykar
created_at: 2025-11-20 00:00:00 UTC
layout: post
---
A few months ago, I was co-facilitating [a "Birds of a Feather" session](https://hasgeek.com/fifthelephant/2025/sub/birds-of-feather-bof-session-finding-signal-in-a-n-8hrRznGe3qf6e7zXxKwcDi) on keeping up with AI progress.

A big talking point that came up from the ICs and engineering leaders that participated was that popular public benchmarks are insufficient for determining if an AI model is a good fit for their product.

![](/images/blog/bof.jpg)

*Pictured above, clockwise: (1) My co-facilitator Lavanya Tekumala. (2) Developers talking about benchmarks and AI-assisted coding. (3) The whiteboard from the session which featured the word "benchmark" three times.*

I want to sharpen this observation a bit more.

## What are benchmarks useful for?

I've seen benchmarks serve a whole range of purposes.

* Benchmarks as decision-making tools: You look at existing benchmarks to figure out whether to use model A or model B.
* Benchmarks as regression markers: Like unit tests—it tells you if your updated AI model or system isn't doing worse than before. This is especially useful in cost-optimisation exercises.
* Benchmarks as optimisation feedback: If you see benchmark go up, you can tell that your model is improving.
* Benchmarks as product behaviour feedback: A more subtle use—with the right analysis of trajectories, benchmarks can tell you about the strengths and weaknesses of your model across categories of tasks you are interested in.
* Benchmarks as RL environments: This is an emerging use case. Reinforcement Learning with Verifiable Rewards effectively works with a setup that doesn't look all too different from a benchmark.

If a benchmark is not helping you with any of the above, your benchmark is useless. Many useless benchmarks unfortunately exist.

## Benchmark illusions and "The vibes"

Here's the Artificial Analysis Intelligence index which aggregates all sorts of AI benchmarks.

![](/images/blog/aa-intelligence-index.png)

And here's the most popular benchmark for testing coding ability.

![](/images/blog/swe-bench-chart-2025-11-27.png)

These charts in isolation suggest that AI models are pretty interchangeable and that whenever a new model comes in, you can reap the fruits of the wonderful frontier lab training pipelines. And switch your coding model to whatever the new hotness is. Right?

No.

The issue with benchmarks is that they are lossy. They condense multidimensional characteristics into a single number. Your business case may not look like whatever your number represents.

Let's take an example. You're working on an AI agent that operates in the legal domain. A profoundly unserious approach would be to look at which model is doing well across standard benchmarks (like the intelligence index above) and pick that. If we put a couple of extra brain cells to work, we might look at an independent benchmark score for the most popular legal benchmark. Right now this is LegalBench.

![](/images/blog/legalbench.png)

Great, so it's still the state-of-the-art Gemini 3 Pro, isn't it? It's clearly #1 on the benchmark[^statsig].

But look at this—there's a CaseLaw (v2) benchmark as well.

![](/images/blog/caselawv2.png)

So, have they forgotten to bench our frontier Gemini model here? Actually no.

Gemini 3 is poor enough at this benchmark that it's nowhere near the top of the leaderboard. In fact, it ranks #39 and is worse than the previous generation Gemini 2.5 Flash!

Both of these are measuring different things in the legal domain, with CaseLaw appearing more like real-world legal work, and LegalBench being more like an academic exam. It's quite possible that Gemini can be good at some parts of some domains and poor at other parts of the same domain. Or maybe the CaseLaw evaluation has some unaddressed issues (after all, there seem to be a lot of surprising results in the leaderboard). Or that Gemini hates Canadians.

This all points to one thing—don't base your decision off benchmark scores. Instead, look at the benchmark contents and methodology, figure how closely it aligns with what tasks you are handing off to the AI and most importantly, **make your own internal benchmark**.

## Minimum viable benchmark

Without getting into the weeds of categorisations, I'd note that internal benchmarks are not all that different from what all the hip and cool new AI Engineering teams like to call *evals*.

They are not structurally different from public benchmarks. You have your dataset of tasks. You (ideally) have your ground truth for these tasks. You measure your AI system against these tasks and get scores. Unfortunately, building a public benchmark is hard work—you have to collect a lot of data to get signal[^statsigcount], ensure the environments are reproducible and your metrics trustworthy. This [ugh field](https://www.lesswrong.com/posts/EFQ3F6kmt4WHXRqik/ugh-fields) has pushed teams away from building evals. Until it's too late—after which everyone is scrambling to do the grunt work of collecting annotated high quality data when the house is burning.

I'd like to propose an alternate view—your internal evals don't need to be as sophisticated as the public benchmarks. They only have to minimal viable benchmarks.

A minimum viable benchmark is not concerned with being an arena for competing AI systems—they are a vehicle for figuring out *whether you are building the right product* and that the product works well.

You don't need to have a nice cozy metric or your LLM eval frameworks in order to get started. You are instead figuring out the crucial part, which is to collect your data and annotate it. You can get started and make a lot of progress in a couple of hours, armed with only an excel sheet.

In your sheet, ensure you have your inputs to your AI system. Add the outputs after a few runs. Add freeform commentary in the last column about how it did.



## "Evals", Internal Benchmarks and Public Benchmarks

## Aligned incentives



[^statsig]: Clearly #1 by a statistically insignificant amount. Almost no one I've seen reasons about whether the score differential is due to random noise or an actual effect.

[^statsigcount]: TODO
