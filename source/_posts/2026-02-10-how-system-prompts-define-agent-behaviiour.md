---
layout: post
title: How System Prompts Define Agent Behavior
date: 2026-02-10 21:34 -0800
description: System prompts matter far more than most assume. A given model sets the theoretical ceiling of an agent’s performance, but the system prompt determines whether this peak is reached.
post-type: regular
last_modified_at:
sitemap: true
featured: true
image: /img/waffle_comparison.jpg
tags: ['RLMs', 'AI', 'Context', 'DSPy', 'Collaboration', 'Context Engineering']
---

_This post was co-authored with [Srihari Sriraman](https://x.com/SrihariSriraman)_

Coding agents are fascinating to study. They help us build software in a new way, while themselves exemplifying a novel approach to architecting and implementing software. At their core is an AI model, but wrapped around it is a mix of code, tools, and prompts: the harness.

A critical part of this harness is the system prompt, the baseline instructions for the application. This context is present in every call to the model, no matter what skills, tools, or instructions are loaded. The system prompt is always present, defining a core set of behaviors, strategies, and tone.

Once you start analyzing agent design and behavior, a question emerges: how much does the system prompt actually determine an agent's effectiveness? We take for granted that the model is the most important component of any agent, but how much can a system prompt contribute? Could a great system prompt paired with a mediocre model challenge a mediocre prompt paired with a frontier model?

To find out, we obtained and analyzed system prompts from six different coding agents. We clustered them semantically, comparing where their instructions diverged and where they converged. Then we swapped system prompts between agents and observed how behavior changed.

System prompts matter far more than most assume. A given model sets the theoretical ceiling of an agent's performance, but the system prompt determines whether this peak is reached.

---

### The Variety of System Prompts

To understand the range of system prompts, we looked at six CLI coding agents: Claude Code, Cursor, Gemini CLI, Codex CLI, OpenHands, and Kimi CLI. Each performs the same basic function: given a task they gather information, understands the code base, writes code, tracks their progress, and runs commands. But despite these similarities, the system prompts are _quite_ different.

![Waffle chart comparisons of 6 coding agent system prompts](/img/waffle_comparison.jpg)

{% capture callout_content %}
[Explore the above figures interactively in **context viewer**](https://nilenso.github.io/context-viewer/g/960d42ad-314c-44cf-8594-4b009ef528a1/comparison?sidebar=0&panel=0&sortBy=category&sortDir=asc&import=https://raw.githubusercontent.com/nilenso/long-prompts-analysis/refs/heads/main/context-viewer-exports/system-prompts-simpler.json).
{% endcapture %}
{% include callout.html content=callout_content style="try-it-out" %}

We're analyzing [exfiltrated system prompts](https://github.com/asgeirtj/system_prompts_leaks), which we clean up and [host here](https://github.com/nilenso/long-prompts-analysis/tree/main/data/prompts/filtered)[^exfiltrated]. Each of these is fed into [context-viewer](https://github.com/nilenso/context-viewer), a tool Srihari developed that chunks contexts in semantic components for exploration and analysis.

Looking at the above visualizations, there is plenty of variety. Claude, Codex, Gemini, and OpenHands roughly prioritize the same instructions, but vary their distributions. Further, prompts for Claude Code and OpenHands both are less than half the length of prompts in Codex and Gemini.

Cursor's and Kimi's prompts are dramatically different. Here we're looking at Cursor's prompt that's paired with GPT-5 ([Cursor uses slightly different prompts when hooked to different models](https://www.adiasg.com/blog/comparing-cursors-prompts-across-models)), and it spends over a third of its tokens on personality and steering instructions. Kimi CLI, meanwhile, contains zero workflow guidance, barely hints at personality instructions, and is the shortest prompt by far.

Given the similar interfaces of these apps, we're left wondering: why are their system prompts so different?

There's two main reasons the system prompts vary: _model calibration_ and _user experience_.

Each model has its own quirks, rough edges, and baseline behaviors. If the goal is to produce a measured, helpful TUI coding assistant, each system prompt will have to deal with and adjust for unique aspects of the underlying model to achieve this goal. This _model calibration_ reins in problematic behavior.

System prompts also vary because they specify slightly different _user experience_. Sure, they're all text-only, terminal interfaces that explore and manipulate code. But some are more talkative, more autonomous, more direct, or require more detailed instructions. System prompts define this UX and, as we'll see later, we can make a coding agent "feel" like a different agent just by swapping out the system prompt.

We can get a glimpse of these two functions together by looking at how a given system prompt changes over time, especially as new versions of models arrive. For example:

![Claude's system prompt vascilates as new models are released, but trends steadily longer](/img/claude_over_time.jpg)

{% capture callout_content %}
[Explore the above figures interactively in **context viewer**](https://nilenso.github.io/context-viewer/g/b179a05f-2bd4-4012-83ab-42a0cb1e79fd/comparison?sidebar=0&panel=0&legend=compact&sortBy=category&sortDir=asc&cols=5&import=https://raw.githubusercontent.com/nilenso/long-prompts-analysis/refs/heads/main/context-viewer-exports/claude-prompt-evolution-export-simpler.json). Or, [check out Codex's system prompt evolution in similar detail](https://nilenso.github.io/context-viewer/g/56b68fb5-7221-4c04-807e-b590f138c1fe/comparison?sidebar=0&panel=0&view=tokens-absolute&legend=compact&sortBy=category&sortDir=asc&cols=10&spr=4&import=https://raw.githubusercontent.com/nilenso/long-prompts-analysis/refs/heads/main/context-viewer-exports/codex-prompt-evolution-export-only-codex.json).
{% endcapture %}
{% include callout.html content=callout_content style="try-it-out" %}

Note how the system prompt isn't stable, nor growing in a straight line. It bounces around a bit, as the Claude Code team tweaks the prompt to both adjust new behaviors and smooth over the quirks of new models. Though the trend is a march upward, as the coding agent matures.

If you want to dive further into Claude Code's prompt history, Mario Zechner has [an excellent site](https://cchistory.mariozechner.at) where he highlights the exact changes from version to version.

{% capture callout_content %}
Sometimes instructions are just..._weird_. Srihari [cataloged some of the odder instructions he found while exploring coding agent system prompts](https://blog.nilenso.com/blog/2026/02/12/weird-system-prompt-artefacts/).
{% endcapture %}
{% include callout.html content=callout_content style="go-deeper" %}

---

### The Common Jobs of a Coding Agent System Prompt

While these prompts vary from tool to tool, there are many commonalities that each prompt features. There is clear evidence that these teams are [fighting the weights](https://www.dbreunig.com/2025/11/11/don-t-fight-the-weights.html): they use repeated instructions, all-caps admonishments, and stern warnings to adjust common behaviors. This shared effort suggests common patterns in their training datasets, which each has to mitigate.

For example, there are _many_ notes about how these agents should use comments in their code. Cursor specifies that the model should, "not add comments for trivial or obvious code." Claude states there should be no added comments, "unless the user asks you to." Codex takes the same stance. Gemini instructions the model to, "Add code comments sparingly... NEVER talk to the user through comments."

These consistent, repeated instructions are warranted. They fight against examples of conversation in code comments, present in countless codebases and Github repo. This behavior goes deep: we've even seen that Opus 4.5 will [reason in code comments if you turn off thinking](https://x.com/aidenybai/status/1993901129210712129).

System prompts also repeatedly specify that tool calls should be parallel whenever possible. Claude should, "maximize use of parallel tool calls where possible." Cursor is sternly told, "CRITICAL INSTRUCTION: involve all relevant tools concurrently... DEFAULT TO PARALLEL." Kimi adopts all-caps as well, stating, "you are HIGHLY RECOMMENDED to make [tool calls] in parallel." 

This likley reflects the face that most post-training reasoning and agentic examples are _serial_ in nature. This is perhaps easier to debug and a bit of delay when synthesizing these datasets isn't a hinderence. However, in real world situations, users certainly appreciate the speed, so system prompts need to override this training.

Both of these examples of _fighting the weights_ demonstrate how system prompts are used to smooth over the quirks of each model (which they pick up during training) and improve the user experience in an agentic coding application.

Much of what these prompts specify is shared; common adjustments, common desired behaviors, and common UX. But their differences notably affect application behavior.

{% capture callout_content %}
Srihari looked at more examples of fighting the weights to understand [how system prompts reveal model biases](https://blog.nilenso.com/blog/2026/02/12/how-system-prompts-reveal-model-biases/).
{% endcapture %}
{% include callout.html content=callout_content style="go-deeper" %}

---

### Do the Prompts Change the Agent?

Helpfully, [OpenCode](https://opencode.ai) [allows users to specify custom system prompts](https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts#method-4-custom-system-prompts). With this feature, we can drop in prompts from Kimi, Gemini, Codex and more, removing and swapping instructions to measure their contribution.

We gave SWE-Bench Pro test questions to two applications: two agents running the Claude Code harness, calling Opus 4.5, but with one one using the original Claude Code system prompt and the other armed with Codex's instructions.

Time and time again, the agent workflows diverged immediately. For example:

![Claude's system prompt defines a more iterative agent](/img/prompt_swap.jpg)

The Codex prompt produced a methodical, documentation-first approach: understand fully, then implement once. The Claude prompt produced an iterative approach: try something, see what breaks, fix it.

This pattern remains consistent over many SWE Bench problems. If we average the contexts for each model and system prompt pair, we get the following:

![Swapping system prompts yielded different behavior for each model](/img/swe_bench_prompts.jpg)

{% capture callout_content %}
[Explore the above figures interactively in **context viewer**](https://nilenso.github.io/context-viewer/g/67175678-6244-45bc-b022-238b72f8e646/comparison?sidebar=0&panel=0&legend=compact&sortBy=category&sortDir=asc&cols=5&import=https://raw.githubusercontent.com/nilenso/long-prompts-analysis/refs/heads/main/context-viewer-exports/swapping-prompts-swe-tasks.json).
{% endcapture %}
{% include callout.html content=callout_content style="try-it-out" %}

All prompt-model combinations correctly answered this subset of SWE Bench Pro questions. But _how_ they suceeded was rather different. The system prompts shaped the workflows.

{% capture callout_content %}
Srihari explored [Codex CLI and Claude Code autonomy](https://blog.nilenso.com/blog/2026/02/12/codex-cli-vs-claude-code-on-autonomy/), and how the system prompt may shape their behavior.
{% endcapture %}
{% include callout.html content=callout_content style="go-deeper" %}

---

### System Prompts Deserve More Attention

Last week, when Opus 4.6 and Codex 5.3 landed, people began putting them through the paces, trying to decide which would be their daily driver. Many tout the capabilities of one option over another, but just as often are complaints about approach, tone, or other discretionary choices. Further, it seems every week brings discussion of a new coding harness, especially for managing swarms of agents.

There is markedly less discussion about the system prompts that define the behaviors of these agents[^foursix]. System prompts define the UX and smooth over the rough edges of models. They're given to the model with _every_ instruction, yet we prefer to talk Opus vs. GPT-5.3 or Gastown vs. Pi.

Context engineering starts with the system prompt.

[^exfiltrated]: Exfiltrated system prompts represent versions of the system prompt for a given session. It's not 100% canonical, as many AI harnesses assemble system prompts from multiple snippets, given the task at hand. But given the consistent manner with which we can extrac these prompts, and comparing them with [public](https://platform.claude.com/docs/en/release-notes/system-prompts) [examples](https://github.com/openai/codex/blob/d452bb3ae5b5e0f715bba3a44d7d30a51b5f28ae/codex-rs/core/prompt.md), we feel they are sufficiently representative for this analysis.
[^foursix]: Though you can use Mario's [system prompt diff tool to explore the changes accompanying Opus 4.6's release](https://cchistory.mariozechner.at/?from=2.1.31&to=2.1.34).

-----

{% include email_subscribe.html %}