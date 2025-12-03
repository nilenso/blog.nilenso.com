---
title: Minimum Viable Benchmark
kind: article
author: Atharva Raykar
created_at: 2025-11-28 00:00:00 UTC
layout: post
---
A few months ago, I was co-facilitating [a "Birds of a Feather" session](https://hasgeek.com/fifthelephant/2025/sub/birds-of-feather-bof-session-finding-signal-in-a-n-8hrRznGe3qf6e7zXxKwcDi) on keeping up with AI progress. This was a group of engineering leaders and ICs.

A big talking point was that popular public benchmarks are insufficient for determining if an AI model is a good fit for their product.

<figure>
  <img src="/images/blog/bof.jpg" alt="Collage from the Birds of a Feather session showing co-facilitator Lavanya Tekumala, developers discussing benchmarks and AI-assisted coding, and a whiteboard featuring the word 'benchmark' three times" style='display: block; width: 70%; margin: 0 auto;'>
  <figcaption>clockwise: (1) My co-facilitator Lavanya Tekumala. (2) Developers talking about benchmarks and AI-assisted coding. (3) The whiteboard from the session which featured the word "benchmark" three times.</figcaption>
</figure>

I want to sharpen this observation a bit more.

## What are benchmarks useful for?

I've seen benchmarks serve a whole range of purposes.

* **Benchmarks as decision-making tools**: You look at existing benchmarks to figure out whether to use model A or model B.
* **Benchmarks as regression markers**: Like unit tests, they tell you if your updated AI model or system isn't doing worse than before. This is especially useful in cost-optimisation exercises.
* **Benchmarks as improvement indicators**: If you see benchmark go up, you can tell that your change to the model or system is improving the outcome.
* **Benchmarks as product behaviour feedback**: A more subtle use—with the right analysis of trajectories, benchmarks can tell you about the strengths and weaknesses of your model across categories of tasks you are interested in.
* **Benchmarks as research agenda setters**: When a new benchmark is published, AI labs start hill-climbing on it—publishing benchmarks is a great way to influence what AI is good at.
* **Benchmarks as RL environments**: This is an emerging use case. Reinforcement Learning with Verifiable Rewards effectively works with a setup that doesn't look all that different from a benchmark.
* **Benchmarks as forecasting anchors**: You can use benchmarks to get a sense of how AI capabilities are progressing over time. [METR](https://evaluations.metr.org/gpt-5-1-codex-max-report/#extrapolating-on-trend-improvements-in-next-6-months) has made good use of this.

If a benchmark is not helping you with any of the above, your benchmark is useless. Many useless benchmarks unfortunately exist.

## Benchmark traps

Here's the Artificial Analysis Intelligence index, which aggregates all sorts of AI benchmarks.

![](/images/blog/aa-intelligence-index.png)

And here's the most popular benchmark for testing coding ability.

![](/images/blog/swe-bench-chart-2025-11-27.png)

These charts in isolation give the impression that AI models are pretty interchangeable and that whenever a new model comes in, you can reap the fruits of the wonderful frontier lab training pipelines. All you need to do is to switch your coding model to whatever the new hotness is. Right?

No.

The issue with benchmarks is that they are lossy. They condense multidimensional characteristics into a single number[^gleechpaper]. Your business case may not look like whatever your number represents.

Let's take an example. You're working on an AI agent that operates in the legal domain. A profoundly unserious approach would be to look at which model is doing well across standard benchmarks (like the intelligence index above) and pick that. If we put a couple of extra brain cells to work, we might look at an independent benchmark score for the most popular legal benchmark. Right now this is LegalBench.

<img src="/images/blog/legalbench.png" style='width: 50%'>

Great, so it's still the state-of-the-art Gemini 3 Pro, isn't it? It's clearly #1 on the benchmark[^statsig].

But look at this—there's a CaseLaw (v2) benchmark as well.

<img src="/images/blog/caselawv2.png" style='width: 50%'>

No Gemini 3 Pro in sight. Have they forgotten to bench our frontier Gemini model here? Actually no.

Gemini 3 Pro is poor enough at this benchmark that it's nowhere near the top of the leaderboard. In fact, it ranks #39 and is worse than the previous-generation Gemini 2.5 Flash!

Both of these are measuring different things in the legal domain, with CaseLaw appearing more like real-world legal work, and LegalBench being more like an academic exam. It's quite possible that Gemini can be good at some parts of some domains and poor at other parts of the same domain. Or maybe the CaseLaw evaluation has some unaddressed issues (after all, there seem to be a lot of surprising results in the leaderboard). Or that Gemini hates Canadians.

This all points to one thing—don't base your decision off benchmark scores. Instead, look at the benchmark contents and methodology, figure out how closely it aligns with what tasks you are handing off to the AI and most importantly, **make your own internal benchmark**[^nilbench].

<figure>
  <img src="/images/blog/eqtweet.png" style='display: block; width: 70%; margin: 0 auto;'>
  <figcaption>Another reason to have internal benchmarks. Not all new models may be better than what came before for your use case.</figcaption>
</figure>

## Minimum viable benchmark

Without getting into the weeds of categorisations, I'd note that internal benchmarks are not all that different from what all the hip and cool new AI Engineering teams like to call *evals*.

They are not structurally different from public benchmarks. You have your dataset of tasks. You (ideally) have your ground truth for these tasks. You measure your AI system against these tasks and get scores. Unfortunately, building a public benchmark is hard work—you have to collect a lot of data to get signal[^statsigcount], ensure the environments are reproducible and your metrics trustworthy. This [ugh field](https://www.lesswrong.com/posts/EFQ3F6kmt4WHXRqik/ugh-fields) has pushed teams away from building evals. Well, at least until it's too late, when you suddenly have everyone scrambling to do the grunt work of collecting annotated high-quality data when the house is burning.

I'd like to propose an alternate view—your internal evals don't need to be as sophisticated as the public benchmarks. They only have to be a *minimum viable benchmark*.

A minimum viable benchmark is not concerned with being an arena for competing AI systems—it is a vehicle for figuring out *whether you are building the right product* and that the product works well.

You don't need to have an intelligent-sounding metric or your LLM eval SaaS vendor figured out in order to get started. You only need to collect your data and annotate it. You can get started and make a lot of progress in a couple of hours, armed with only a spreadsheet and your product and engineering teams in one room.

In your sheet, ensure you have your inputs to your AI system. Add the outputs after a few runs in the system for the tasks you need[^notevensystem]. Add free-form commentary in the last column about how it did. Don't optimise anything yet. Don't add any "metrics" yet.

After this exercise, a few things happen:

* You realise what your task is actually like and what it might involve.
* You realise whether the AI works at all for your task.
* You realise what it feels like to be a user of your system and get a better sense of where AI is actually helping. This is input for the product team.
* You realise what actually needs to be measured for your benchmark metrics. It's never the vague, pointless metrics that came with the eval framework you were looking at.
* The metrics you discover are often useful product metrics!
* You catch the biggest blind spots of the AI system very early on. Gathering large datasets is needed only when you are trying to catch *small effects*. Early on, most of observed effects on any intervention will be quite large!
* Most importantly, you have overcome the Ugh Field! This exercise is often fun.

This minimal viable benchmark would have already proven its usefulness early on. Everyone in your team will continue to build on top of this and rely on it when, inevitably, you have to avoid regressions, evaluate a new feature or model or optimise costs. Over time, your minimal viable benchmark can grow into a useful, strong benchmark that forms the backbone of your AI project.

How we go from a minimal viable benchmark to a maximally useful benchmark would perhaps need its own article. But to give you a taste, ensure you have these properties:

* It's easy to look at the data and your cross-functional team is involved in reviewing the data regularly.
* What you are measuring maps to product outcomes.
* There are enough samples to actually give you a sense of whether your system has actually improved.
* The tasks have a difficulty ramp-up to actually capture improvements to models and systems. If most of your tasks have the same difficulty, and a newly released AI model gains the ability to do that task, your benchmark would get saturated overnight and cease to capture further improvements.
* The metrics are measured either deterministically or with an unbiased estimator[^llmjudge].

## Anyway,

* Don't trust public benchmark numbers without seeing if the methodology and numbers map to your product outcomes.
* Build your own minimal viable benchmark.
* It's not that hard to start with, and it's really worth it. Don't skimp on measuring whether your product works!

- - -

## Footnotes

[^gleechpaper]: As I was writing this article, I came across Gavin Leech's [Paper AI Tigers](https://www.gleech.org/paper#:~:text=Even%20less%20generalisation) which goes deeper into all the ways in which benchmarks fail to generalise on other tasks.

[^statsig]: Clearly #1 by a statistically insignificant amount. I've almost never seen anyone reason about whether the score differential is due to random noise or an actual effect.

[^nilbench]: Our internal benchmark for StoryMachine has already caught on to the fact that Sonnet 4.5 is a lousy User Acceptance Tester compared to GPT-5. This is not something that would have been obvious from public benchmarks. When Opus 4.5 came out, I was able to immediately run the benchmark and confirm that there was indeed an improvement on that front. This becomes critical as the models get smarter and [it gets harder to figure out what they are good at](https://simonwillison.net/2025/Nov/24/claude-opus/#:~:text=The%20frontier,Diamond).

[^statsigcount]: Chip Huyen's AI Engineering book brought this handy heuristic chart to my attention—this works well for binary classification evals (it's made some assumptions about the data being somewhat independent, so treat it more like a heuristic)
    
    ![](/images/blog/huyenheuristic.png)

[^notevensystem]: Sometimes, you don't need a working system at all—if your use case supports it, I sometimes just paste the prompt we would use to ChatGPT or Claude. Or if the work is more "agentic", I'd send it to Claude Code or OpenHands.

[^llmjudge]: I have seen a lot of LLM-as-a-judge setups that are quite unprincipled and do not address the rather basic question of "who judges the judge?". To date, I have found only two principled ways to do this—the first is Eugene Yan's [Product Evals Recipe](https://eugeneyan.com/writing/product-evals/), where you measure the judge's agreement with human annotations, and align the judges accordingly. The other one is [this paper](https://arxiv.org/abs/2511.21140v1) which proposes a statistically sound way to to report LLM judge metrics with bias adjusted accuracy and confidence intervals. Both these approaches are complementary.
