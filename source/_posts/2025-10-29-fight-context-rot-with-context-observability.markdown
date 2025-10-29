---
title: Fight context rot with context observability
kind: article
author: Srihari Sriraman
created_at: 2025-10-29 00:00:00 UTC
layout: post
---
TL;DR: You can’t fix what you can’t see. I built a tool that pulls apart LLM context into meaningful components that you can see, measure, and then meaningfully engineer.

## The need for context observability

Context engineering is one of the most important aspects of AI Engineering.

* [Andrej Karpathy:](https://x.com/karpathy/status/1937902205765607626) “In every industrial-strength LLM app, context engineering is the delicate art and science of filling the context window…”, and we need to “pack the context windows just right”.
* [Drew Breunig:](https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html) “…context is not free. Every token in the context influences the model’s behavior, for better or worse.”, and “The massive context windows of modern LLMs are a powerful capability, but they’re not an excuse to be sloppy with information management.”

And yet, we don’t have the tools to really *see* the context, or pull it apart into *tangible* components we can analyse for relevance. That kind of observability of the context seems to be missing. If we want to fight the “Garbage In, Garbage Out” phenomenon, we should be able to observe the garbage in the context to prune it out.

Existing observability tools seem to be primarily focused on system metrics like latency, cost, error rates, or high-level agent tracing (see section below for more details). They might show a flame-graph of requests and responses, but not what kind of content is crowding up the context window over time.

In his [“How Long Contexts Fail”](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html), and [“How to Fix Your Context”](https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html) posts, Drew Breunig details these failure mechanisms and methods to combat them.

![context-rot-problems](/images/blog/context-observability-image.png)

But we need to detect and diagnose these kinds of issues before we can solve for them. Hrm. If only we had a tool that could deal well with large unstructured text, segment and classify it, and also detect these issues.

## Context viewer

So I built a tool to provide this kind of observability, and it is called [context-viewer](http://github.com/nilenso/context-viewer) (I like pithy names). It is an open source tool I built over last week. It doesn’t have a server component, and is designed to work directly in the browser for convenience. Feel free to fork, tweak, raise PRs.

You drag-drop a conversation JSON log into it, and with some AI assistance, it pulls it apart into tangible components, and lets you see its growth over time. Here’s what it looks like for a run of [StoryMachine](https://github.com/nilenso/storymachine), which is currently a simple workflow. 

For context, the initial prompt provides product requirements and a tech spec, then it reads the repository to get a relevant summary, and then breaks down the work into user stories in stages with some human feedback. There’s more details in a section below.

You can see the components change and grow over time,

<video src="https://github.com/user-attachments/assets/5bfc3f49-88f3-4f03-9666-ad0007b585b3" controls preload></video>

visualise growth of components as percentages of total token count,

<video src="https://github.com/user-attachments/assets/8ab364b3-8460-4931-856e-183ca59f701f" controls preload></video>

and filter, sort, search through messages in a conversation however you’d like.

<video src="https://github.com/user-attachments/assets/48b8ddf3-bdda-4da2-afdd-47e264514fd8" controls preload></video>

Here’s that Github link again, if you want to try it out: [nilenso/context-viewer](https://github.com/nilenso/context-viewer/)

## How it works

It’s a fairly simple process with a few steps.

1. **Parse the conversation**: This is currently one of the open-ai formats of chat-completions / responses / conversations API logs. It’s easy enough to parse another format. You can also drop multiple conversations to process them in parallel. Interface has basic search, filtering and sorting too.
2. **Count the tokens:** It uses [dqbd/tiktoken](https://github.com/dqbd/tiktoken)’s WASM bindings to count tokens per message in parallel.
3. **Segment large messages:** Messages over a certain threshold of tokens (which is 500, somewhat arbitrarily) get broken down into smaller pieces using AI. If there are multiple parts in a single prompt / message, the parts get broken down here. This is basically a dead-simple-single-prompt version of [semantic chunking](https://x.com/GregKamradt/status/1738276097471754735), lot of room to improve this.
4. **Find components:**  Given the entire conversation, an AI call identifies the components, and another call assigns components to individual messages.
5. **Visualise:** The components view follows [anthropic’s visualisation](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) of context. There’s a time-slider that lets one traverse through how context fills up, and there’s also a simple stacked bar graph that shows growth over time.
6. **Synthesize:** Given the generated data of component growth over time, and a summary of the conversation, an AI can do a pretty great job of telling us about growth patterns good and bad, redundancy, and relevance.

The prompts are very short descriptions of the goals, targeted at what the simplest model is very good at. I’ve been using the 2-generation old gpt-4o-mini, I find it’s good enough for this. You could probably use a local gpt-oss model or equivalent to reasonable success. You can also tweak the prompts right in the UI, and iterate on the components until you get to a classification you’re happy with.

Analysing a \~13k tokens conversation takes \~15s, for all the steps above, end to end, including the non-AI aspects, and a \~35k tokens conversation took \~40s. I’d say it scales linearly. I didn’t care too much about performance or cost with this tool. But if I find that this is worth building out into something more full fledged and practical for large scale usage, then it’ll probably be redesigned. Suggestions welcome!

## Why I built this, and how it has helped

I ran into this need pretty quickly when working on [StoryMachine](https://github.com/nilenso/storymachine). StoryMachine is a fairly simple workflow currently. It takes a PRD, a tech spec, reads the codebase, and generates stories with some user feedback. Still, it’s a fair number of turns in a long conversation. And more importantly, the conversation involves iterating over artefacts of stories, and I knew that every iteration of a story would be adding the whole story to the context again, leading to redundancy.

I wanted to see this happening. So that I could verify that this is indeed a problem, and a big enough problem warranting an engineering solution. I also wanted this feedback loop for myself so I could prioritise my attention to truly important issues.

A few ways in which I immediately saw benefits:

* I could “see” the conversation happen. A summary of what happened in the conversation, how many turns, tool calls etc, helped me quickly get a grip on what I’m analysing.
* The components it detected were “project_specifications”, and “product_specifications”. I had made a typo! And the LLM could have been looking at these as two different docs when they were actually the same doc. And I guess more importantly, this was duplicated context occupying about 13% of context window.
* The questions used to generate the relevant repository context are not relevant after that activity, but they remain in context unnecessarily. The AI generated analysis told me this, and I could see it visually too. This was about 2% in terms of size. But then again, even a small amount of poison could be lethal depending on the type of poison; size isn’t everything.

## About using AI to analyse

This is certainly a debatable design choice, so here are my thoughts around it:

1. It’s a bit annoying to use another AI, burning more tokens and money to come up with something that could be a first class concept in an AI SDK. If we segmented our prompts correctly, split apart using XML tags with attributes for identifying components, and also tag all tool calls and tool responses, then we should have a lot of the data already organised for observability. Similar to emitting rich product events from applications. I think this is a good idea worth exploring. However, the responses from LLMs that also go into context do need to be broken down, and we don’t really control that.

   1. DSPy’s [Signatures](https://dspy.ai/learn/programming/signatures/) is a layer of abstraction that’s well suited for this sort of annotation at the request side.
2. The model I’ve been using so far is gpt-4o-mini, which is 2 generations old, but I use it just because it is fast, and it seems to be good enough. I bet one could use a gpt-oss model, or some other local tiny model to similar results. That way this analysis could be fast, and private too.
3. Semantic chunking, and identifying components can happen across any arbitrary dimension. It is essential to have a way to modify the process to be better suited to each conversation / product / workflow’s needs. Using simple AI prompts here is a nice method that permits this. context-viewer lets you change the prompts and re-run the analysis so you can iteratively get the observability you need.
4. At scale, some of this would not be feasible anymore, especially inside a browser tab. If one wanted to analyse 1000 conversations of a kind, running through 10s of AI calls per conversation isn’t sustainable or even meaningful. We’d have to engineer around it. Perhaps one can use this kind of a tool to explore and figure out how they want to analyse their conversations, and then engineer a custom data pipeline that scales, perhaps without AI. Semantic chunking methods that are not LLM based could be one way to go.

## On existing observability tools

The LLM observability space is large with lots of players in the field like Braintrust, Helicone, Langfuse, Arize, WhyLabs, Fiddler, Evidently, etc. Their focus [seems to be largely on](https://chatgpt.com/share/6900eed2-01e4-800a-9106-880e1e351144):

1. **Logging and tracing:** see input, output, spans, traces, latencies, flame graphs, timelines for agents, etc.
2. **Token Usage & Cost Monitoring:** observability for optimising unit economics, cost per request, performance, efficiency.
3. **Latency, Throughput & Error Rate Monitoring:** more traditional engineering systems observability features to help keep systems reliable.
4. **Anomaly and outlier detection**: To improve the effectiveness of above metrics
5. **ML Observability:** Data and concept drift detection in input, output, or features
6. **Output Quality Evaluation:** Broad relevance, quality, success scores

Not that these aren’t important, but they don’t give the kind of feedback I’m looking for on my context. I find that almost all of these tools treat the context as a singular entity, and don’t really break them down for analysis.

Further, the kind of analysis I’m referring to here feels more domain, or product specific. Something I’d expect to find in a Mixpanel / Statsig dashboard, not in a datadog dashboard. The analysis of events is however still not similar to the way product metrics are usually analysed.

LangChain’s [insights agent](https://blog.langchain.com/insights-agent-multiturn-evals-langsmith/) that came out last week comes closest to what I’m looking for.

- - -

## Try it out

* Go to [nilenso/context-viewer](https://github.com/nilenso/context-viewer/), and clone it
* Add AI API keys in environment variables as `README.md` says, build and run it.
* Export your context as a JSON file. Honestly, this isn’t as straightforward as I would like for it to be. Currently I’ve built support for Open AI formats:

  * For responses format you can use the [input-items](https://platform.openai.com/docs/api-reference/responses/input-items) API
  * For conversations format you can use [list-items](https://platform.openai.com/docs/api-reference/conversations/list-items) API
  * For chat-completions, I used an internal dashboard API: [`https://api.openai.com/v1/dashboard/chat/completions/chatcmpl-`](https://api.openai.com/v1/dashboard/chat/completions/chatcmpl-CTqZR1lcRYXtUTRJPVLRzAWKCZpCN)`id`
  * For other formats, adding another parser is just [a prompt](https://github.com/nilenso/context-viewer/blob/main/docs/prompts.md#support-conversation-format) away.
* Drag-drop it into context-viewer on the browser

I had a lot of fun building this, and I plan to write about that experience. Meanwhile, here’s an end-to-end demo at 2x:

<video src="https://github.com/user-attachments/assets/91d6fe07-ba9d-45f0-8892-23bf70f21833" controls preload></video>

I’d love to hear what you think. Join the discussion on Hacker News! Contributions welcome through PRs. You can also tweet [@nilenso](https://x.com/nilenso), or email us at [hello@nilenso.com](mailto:hello@nilenso.com) to reach us.
