---
title: Internal Benchmarks
kind: article
author: Atharva Raykar
created_at: 2025-11-20 00:00:00 UTC
layout: post
---
A few months ago, I was co-facilitating [a "Birds of a Feather" session](https://hasgeek.com/fifthelephant/2025/sub/birds-of-feather-bof-session-finding-signal-in-a-n-8hrRznGe3qf6e7zXxKwcDi) on keeping up with AI progress. This was a group of engineering leaders and ICs.

A big talking point was that popular public benchmarks are insufficient for determining if an AI model is a good fit for their product.

![](/images/blog/bof.jpg)

*Pictured above, clockwise: (1) My co-facilitator Lavanya Tekumala. (2) Developers talking about benchmarks and AI-assisted coding. (3) The whiteboard from the session which featured the word "benchmark" three times.*

I want to sharpen this observation a bit more.

## What are benchmarks useful for?

I've seen benchmarks serve a whole range of purposes.

* Benchmarks as decision-making tools: You look at existing benchmarks to figure out whether to use model A or model B.
* Benchmarks as regression markers: Like unit tests—it tells you if your updated AI model or system isn't doing worse than before. This is especially useful in cost-optimisation exercises.
* Benchmarks as optimisation feedback: If you see benchmark go up, you can tell that your model is improving.
* Benchmarks as product behaviour feedback: A more subtle use—with the right analysis of trajectories, benchmarks can tell you about the strengths and weaknesses of your model across categories of tasks you are interested in.
* Benchmarks as research agenda setters: When a new benchmark is published, AI labs start hill-climbing on it—publishing benchmarks is a great way to influence what AI is good at.
*
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

They are not structurally different from public benchmarks. You have your dataset of tasks. You (ideally) have your ground truth for these tasks. You measure your AI system against these tasks and get scores. Unfortunately, building a public benchmark is hard work—you have to collect a lot of data to get signal[^statsigcount](TODO), ensure the environments are reproducible and your metrics trustworthy. This [ugh field](https://www.lesswrong.com/posts/EFQ3F6kmt4WHXRqik/ugh-fields) has pushed teams away from building evals. Until it's too late—after which everyone is scrambling to do the grunt work of collecting annotated high quality data when the house is burning.

I'd like to propose an alternate view—your internal evals don't need to be as sophisticated as the public benchmarks. They only have to build a *minimum viable benchmark*.

A minimum viable benchmark is not concerned with being an arena for competing AI systems—they are a vehicle for figuring out *whether you are building the right product* and that the product works well.

You don't need to have a nice cozy metric or your LLM eval frameworks in order to get started. You are instead figuring out the crucial part, which is to collect your data and annotate it. You can get started and make a lot of progress in a couple of hours, armed with only an excel sheet and your product and engineering teams in one room.

In your sheet, ensure you have your inputs to your AI system[^notevensystem]. Add the outputs after a few runs. Add free-form commentary in the last column about how it did. Don't optimise anything yet. Don't add any "metrics" yet.

After this exercise a few things happen:

* You realise what your task is actually like and what it might involve.
* You realise whether the AI works at all for your task.
* You realise what it feels like to be a user of your system and get a better sense of where AI is actually helping. This is input for the product team.
* You realise what actually needs to be measured for your benchmark metrics. It's never the vague pointless metrics that came with the eval framework you were looking at.
* Your discovered benchmark metrics are often useful product metrics!
* You catch the biggest blind spots of the AI system very early on. Gathering a large datasets are needed only when you are trying to catch *small effects*. Early on, most of your effects will be quite large!
* Most importantly, you have overcome the Ugh Field! This exercise is often fun. You have now made stone soup[^stonesoup].

This minimal viable benchmark would have already proven its usefulness early on. Everyone in your team will continue to build on top of this and rely on this when inevitably you have to avoid regressions, evaluate a new feature or model or optimise costs. Over time your minimal viable benchmark can grow into a useful, strong benchmark that forms the backbone of your AI project.

How we go from a minimal viable benchmark to a maximally useful benchmark would perhaps need its own article. But to give you a taste, ensure you have these properties:

* It's easy to look at the data. And that your cross-functional team is involved in reviewing the data regularly.
* What you are measuring maps to product outcomes.
* There are enough samples to actually give you a sense of whether your system has actually improved[^binomialchart].
* The tasks have a difficulty ramp-up to actually capture improvements to models and systems. If most of your tasks have the same difficulty, and a newly released AI model gained the ability to do that task, your benchmark would get saturated overnight and cease to capture further improvements.
* The metrics are measured either deterministically or with an unbiased estimator[^llmjudge].

## Anyway,

* Don't trust public benchmarks numbers without seeing if the methodology and numbers map to your product outcomes.
* Build your own minimal viable benchmark.
* It's not that hard to start with, and it's really worth it. Don't skimp on measuring whether your product works!

- - -

## Footnotes

[^statsig]: Clearly #1 by a statistically insignificant amount. Almost no one I've seen reasons about whether the score differential is due to random noise or an actual effect.

[^notevensystem]: Sometimes, you don't need a working system at all—if your use case supports it, I sometimes just paste the prompt we would use to ChatGPT or Claude. Or if the work is more "agentic", I'd send it to Claude Code or OpenHands.

[^stonesoup]: The Stone Soup story, with apologies to Andy Hunt and Dave Thomas:
    
    The three soldiers returning home from war were hungry. When they saw the village ahead, their spirits lifted—they were sure the villagers would give them a meal. But when they got there, they found the doors locked and the windows closed. After many years of war, the villagers were short of food, and hoarded what they had.
    
    Undeterred, the soldiers boiled a pot of water and carefully placed three stones into it. The amazed villagers came out to watch.

    “This is stone soup,” the soldiers explained.

    “Is that all you put in it?” asked the villagers.

    “Absolutely—although some say it tastes even better with a few carrots.”

    A villager ran off, returning in no time with a basket of carrots from his hoard.

    A couple of minutes later, the villagers again asked, “Is that it?”

    “Well,” said the soldiers, “a couple of potatoes give it body.” Off ran another villager.

    Over the next hour, the soldiers listed more ingredients that would enhance the soup: beef, leeks, salt, and herbs. Each time, a different villager would run off to raid their personal stores.

    Eventually they had produced a large pot of steaming soup. The soldiers removed the stones, and they sat down with the entire village to enjoy the first square meal any of them had eaten in months.

    There are a couple of morals in the stone soup story. The villagers are tricked by the soldiers, who use the villagers’ curiosity to get food from them. But more importantly, the soldiers act as a catalyst, bringing the village together so they can jointly produce something that they couldn't have done by themselves—a synergistic result. Eventually everyone wins.

    Every now and then, you might want to emulate the soldiers.

    You may be in a situation where you know exactly what needs doing and how to do it. The entire system just appears before your eyes—you know it’s right. But ask permission to tackle the whole thing and you’ll be met with delays and blank stares. People will form committees, budgets will need approval, and things will get complicated. Everyone will guard their own resources. Sometimes this is called “start-up fatigue.”

    It’s time to bring out the stones. Work out what you *can* reasonably ask for. Develop it well. Once you’ve got it, show people, and let them marvel. Then say, “Of course, it would be better if we added…” Pretend it’s not important. Sit back and wait for them to start asking you to add the functionality you originally wanted. People find it easier to join an ongoing success. Show them a glimpse of the future and you’ll get them to rally around.
