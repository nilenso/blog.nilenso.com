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

## Benchmark illusions and "The vibes"

Here's the Artificial Analysis Intelligence index which aggregates all sorts of AI benchmarks.

![](/images/blog/aa-intelligence-index.png)

And here's the most popular benchmark for testing coding ability.

![](/images/blog/swe-bench-chart-2025-11-25.png)

These charts in isolation suggest that AI models are pretty interchangeable and that whenever a new model comes in, you can reap the fruits of the wonderful frontier lab training pipelines. And switch your coding model to whatever the new hotness is. Right?

No.

The issue with benchmarks is that they are lossy. They condense multidimensional and qualitative abilities into a number. Your business case may not look like whatever your number represents.

Let's take an example. You're working on an AI agent that operates in the legal domain. A profoundly unserious approach would be to look at which model is doing well overall in the benchmark (like the intelligence index above) and pick that. If we put a couple of extra brain cells to work, we might look at an independent benchmark score for the most popular legal benchmark. Right now this is LegalBench.

![](/images/blog/legalbench.png)

Great, so it's still the state-of-the-art Gemini 3 Pro, isn't it? It's clearly #1 on the benchmark [^statsig].



Case Law v2 Gemini vs LegalBench Gemini

UAT experience

### The vibes



## Models aren't fungible

## "Evals", Internal Benchmarks and Public Benchmarks

## Aligned incentives

## Minimum viable benchmark



[^statsig]: Clearly #1 by a statistically insignificant amount. Almost no one I've seen reasons about whether the score differential is due to random noise or an actual effect.
