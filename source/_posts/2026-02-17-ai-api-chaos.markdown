---
title: The LLM provider standardisation problem
kind: article
author: Atharva Raykar
created_at: 2026-02-17 00:00:00 UTC
layout: post
---
LLM provider standards are in a very bad place. It's a mess, actually.

Initially, we had the completions API back when most chat assistants weren't the dominant paradigm—like with GPT-2 and G GPT-3. Then we had something called the chat completionns API, which took off around the time ChatGPT-3 launched. This is what people are using with GPT-3.5, GPT-4, the Turbo variants, and so on. This somewhat stuck as a standard for some time—the stateless way of passing messages.

But it was clearly made in a rush. In fact, there's a tweet from OpenAI that shows how they basically built it over a weekend hackathon—and it shows. Anthropic, Google and the others made different APIs with very different designs.

At the time, agentic applications weren't the dominant paradigm, so a lot of things got tacked on to this API, making it extremely unwieldy. Capabilities were also changing rapidly.

Then at some point, OpenAI came up with the Responses API, which is what they're now pushing toward with all their new model releases. The entire ecosystem—from Lite LLM to OpenRouter to all the open-source libraries—was already standardized on OpenAI chat completions compatibility. That slight semblance of standardisation went away.

Now we have massive fragmentation.

So now, if you're building an LLM application, you have to make a choice about how you're calling the LLMs. One option is to stick to the native providers. So if you're using Anthropic models, you use the Anthropic API. If you're using OpenAI models, you use the OpenAI API, and so on. This works fine. Unfortunately, the issue is that there's always a new "best" model or new releases coming from different labs, and they're all pretty competitive—constantly overtaking each other. That means you have to change providers frequently, and if you're tied to a native provider, you're kind of stuck.

Another option is to use a gateway. The most popular one is LiteLLM, and it has become a kind of load-bearing backbone. A lot of big frameworks and AI applications actually depend on LiteLLM. Unfortunately, to put it politely—or not so politely—LiteLLM is a sloppy codebase. It's extremely buggy, it's terrible, it's just awful, and it breaks a lot of behaviors. There’s always a lag in a race to support every new feature that’s specific to each model, and this might or might not materialize—which is quite bad for your own use cases.

