---
title: Bitter Lesson applied AI
kind: article
author: Atharva Raykar
created_at: 2025-10-14 00:00:00 UTC
layout: post
---
Everyone is talking about Richard Sutton’s bitter lesson once again[^1].

> The biggest lesson that can be read from 70 years of AI research is that general methods that leverage computation are ultimately the most  effective, and by a large margin.
> 
> 
> Rich Sutton, [The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)
> 

I highly recommend taking a detour to read Richard’s essay if you haven’t yet, before coming back to this page. It’s very short.

Here’s my observation: The bitter lesson applies to developers building and working with AI applications as well—and many have not yet digested the bitter lesson.

## How not to code with AI

There’s a type of AI-maximalist programmer that I have seen—you’ll often find them at vibe coding events, workshops and demos. Their setup often has a folder full of text files that describe “rules”, “modes”, “roles”, prompts, or subagents. It often looks like a dump of all possible individual actions a developer can take—PRD analyser, planner, user story writer, code reviewer, UAT tester, etc. They are full of long instructions, with lots of “pleading” language, capitalisation and even step-by-step logic telling an LLM how it should think.

The fundamental error in the above methods is that they bake in assumptions of what a workflow should look like, and how the agent should operate. They meddle with the model’s behaviour. It is what Sutton would describe as a “human knowledge based” method.

Some of these tricks were necessary when the models were weaker and less agentic. Today, they can reason well and learn from the feedback in the environment. Force-fitting a complex web of workflows and roles is potentially [fighting against the model weights](https://x.com/dbreunig/status/1965855381529436639).

The engineer that has digested the bitter lesson will instead [set up an environment that can provide feedback loops to the agent](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/). This setup is simpler and better accommodates frontier reasoning models that are scaled with reinforcement learning by getting out of their way.

## How not to build LLM wrappers

The first generation of AI coding tools (Cursor, Sourcegraph Cody, Codeium[^2], Copilot) heavily used chunk-and-embed paradigm, ie, have a separate vector embeddings storage layer that prefills retrieved chunks into the LLM’s context window. [^3]

Newer AI tools (Cline, Windsurf, Amp, Claude Code, Codex, OpenHands) eschew pre-filled retrievals in favour of agentic search—ie, tell the AI how to invoke a search, and let it figure it out from there. How the search is performed is an implementation detail.

The latter approach is more bitter-lessoned. Do not bake in your human knowledge assumptions by prefilling items into the agent’s context window.

Reinforcement learning produces goal-seeking agents. Anyone who has digested the bitter lesson knows that more compute is being poured into these LLMs to make goal-seekers (they get a reward signal when they achieve their goal). Leverage this fact. As models get better at goal-seeking in general, they will get better inside applications that mirror this action → feedback loop.

We can generalise this for most LLM-enabled applications.

Let’s contrast some human-knowledge driven “artisanal” architectures against more “bitter-lessoned” architectures which could represent two ends of a spectrum.

| Artisanal architecture | Bitter-lessoned architectures |
| --- | --- |
| Prescriptive workflows | Take actions, respond to feedback in a loop |
| Prefilling tokens into prompts | Giving models an objective and some tools |
| Stages and modes | Modeless |
| embed-and-chunk | Agentic search |
| Makes assumptions about how a model should operate and think | Sets up an environment and context that a model can verify itself against |
| Imperative | Declarative |
| Specialised tool interfaces | Code execution |

## Signals affirming the bitter lesson influencing application design

- GPT-5 Codex resulted in [a new system prompt](https://github.com/openai/codex/blob/main/codex-rs/core/prompt.md) in Codex CLI. It shrunk from ~300 lines to ~100 lines.
- [The Claude Code prompt](https://github.com/marckrenn/cc-mvp-prompts/compare/v1.0.128...v2.0.0) also shrank. The multi-edit tool call was removed, further simplifying the program.
- Claude Code creators [actively avoided prefilled context and embed-and-chunk](https://www.latent.space/i/163091105/memory-and-the-future-of-context), directly citing the bitter lesson.
- Cloudflare introduced [code mode](https://blog.cloudflare.com/code-mode/), where it rewrites MCP tool interfaces into typescript interfaces, because the LLM is much more competent at writing and composing code. While providing tools are more bitter lessoned than prefilled context windows, I thought this goes a step further.

## When to use artisanal architectures

This is not to say that artisanal architectures are bad. What I’m saying is that artisanal architectures must account for the bitter lesson.

When the model isn’t good at your task yet, but may get there under the current scaling regime—design an artisanal architecture to build what is needed today, but do so with the knowledge that some day you may have to throw this functionality away—make the artisanal parts especially easy to remove when the bitter lesson inevitably strikes. [4]

A more permanently artisanal architecture also makes sense when your task does not require a repeated sequence of actions and deep thinking, for example, a classification task in a pipeline or a task to link similar address records.

## Make a note of what is *not* scaling with compute

With current scaling methods verifiable tasks with clear goals will continue to improve: coding, searching, mathematics. Leave the methods of achieving the goal to the agent.

Current training methods have also not scaled context window sizes as reliably—so you might want to hold on to subagents and context-compaction tricks.

Training methods will also not solve for important parts that are gluing things together, like retries and reliable execution, or good interface design.

### Footnotes

[^1]: I am aware that even though this whole article is going to be LLM-centric, Sutton himself does not believe LLMs are the most “bitter lesson-pilled” AI architecture. But there’s a spectrum to the bitter lesson and LLMs are definitely less human-knowledge based than other generalist AI architectures.

[^2]: Before Codeium became the more agentic windsurf.

[^3]: There’s also Aider—while it is not using embeddings, inserts a repomap into the LLM context, which makes it a form of prefilling.

[^4] Devin: One type of artisanal to another

---

_Thanks to Ravi Chandra Padmala for reviewing drafts of this._
