---
title: How I keep up with AI progress (and why you must too)
kind: article
author: Atharva Raykar
created_at: 2025-06-23 00:00:00 UTC
layout: post
---
_Last Updated: 23rd June 2025_

Generative AI has been the fastest moving technology I have seen in my lifetime. Its capabilities also happen to be terribly misunderstood.

Organisations that underestimate the capabilities of AI are likely to miss out on its disruption potential. An example most visible to me is missing out on the [speed increase](https://www.youtube.com/watch?v=KVZ3vMx_aJ4) brought in by [AI coding tools](/blog/2025/05/29/ai-assisted-coding/).

Those that still view AI as mostly unreliable "stochastic parrots" will likely lose to those that understand and integrate AI effectively.

I've seen organisations also overestimate how capable AI is due to the undue hype around it. Some of this comes from the frontier labs laying out bold targets for achieving "AGI", but a lot of it comes from a slew of "influencers" and people who frankly don't know what they are talking about.

Not understanding the capabilities of the technology well enough can lead to disastrous consequences. We have already seen large [companies](https://www.youtube.com/watch?v=TwdduNZJKUM) and even [governments](https://themarkup.org/news/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law) ship dysfunctional or even [dangerous](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/#this-is-a-very-common-problem) AI products. Sufficiently uninformed people [misunderstand how to apply AI](https://arstechnica.com/tech-policy/2023/06/lawyers-have-real-bad-day-in-court-after-citing-fake-cases-made-up-by-chatgpt/) with real and negative consequences.

The pattern for errors of overestimation and underestimation are rooted in lack of a solid understanding of the technology and how it is evolving over time. As technologists, it is our responsibility to deeply understand emerging technology. It's good for business. More importantly, technologists should take responsibility for the consequences of what we build, and that means we must understand what the capabilities of AI are before rushing to ship something.

This is surprisingly challenging. We are in one of the most polluted information environments. If you're not being deliberate about it, you are likely to be exposed to a lot of misinformation that overstates or dismisses the capability of AI.

To help with this, I've curated a list of sources that make up an information pipeline that I consider balanced and healthy. If you're late to the game, consider this a good starting point.

## General guidelines

* Stay close to the source. The further you stray from reading official announcements and write-ups from the AI labs, the more likely you are going to be exposed to noise. Always assume that all reporting is wrong by default, unless it's coming from the primary source.
* Follow trustworthy individuals for commentary. I have linked to many individuals who I consider to be commenting and talking about AI developments in good faith and a deep sense of curiosity.


## Starting Points

### [Simon Willison's Blog](https://simonwillison.net/tags/ai/)

* The best starting point for most technical people. If I had to only pick one stream of information, it would be this one.
* He's also known for creating Django and Datasette.
* Expect:
    * Commentary on the frontier of AI capabilities
    * Application layer use cases
    * Commentary on security issues and ethics
* A sample: [The Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), [LLMs in 2024](https://simonwillison.net/2024/Dec/31/llms-in-2024/)

### Andrej Karpathy on [Twitter](https://x.com/karpathy) and [YouTube](https://www.youtube.com/@AndrejKarpathy)

* Director of AI @ Tesla, was a founding member of OpenAI.
* The best starting point to get an overview of how the models themselves work. His 3.5 hour video is the best million feet overview on the internals of LLMs and surprisingly approachable for relatively non-technical people too.
* Expect:
    * Commentary on the frontier of AI capabilities
    * Approachable explanations on the internals of AI (I haven't gone through all of these yet, but heard praise for his GPT-2 from scratch and zero to hero tutorials)
    * Strong cultural influence and observations on AI impact. He coined the terms "vibe coding" and "jagged intelligence".
* A sample: [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI&pp=ygUIa2FycGF0aHnSBwkJvgkBhyohjO8%3D), [How I Use LLMs](https://www.youtube.com/watch?v=EWvNQjAaOHw&pp=ygUIa2FycGF0aHk%3D)

### [Every's Chain of Thought](https://every.to/chain-of-thought?sort=newest)

* Written by Dan Shipper, the co-founder of Every. I like going through their test runs of the latest frontier models. It's also a good way to get a sense of how these AI models can be used everyday.
* Expect: Practical applications of AI at work, vibe-checks for model capabilities outside of benchmark numbers.
* A sample: [Vibe Check: Codex](https://every.to/chain-of-thought/vibe-check-codex-openai-s-new-coding-agent), [Vibe Check: o3](https://every.to/chain-of-thought/vibe-check-o3-is-out-and-it-s-great)

## Official announcements, blogs and papers from those building AI

Anyone trying to keep up with AI developments must follow the work of the AI labs building them. Even though they sometimes get a bad rap for hyping up AI capabilities, their official announcements have a lot of valuable and generally accurate information on the capabilities of AI.

Always look out for the announcements from [OpenAI](https://openai.com/news/), [Google DeepMind](https://deepmind.google/), [Anthropic](https://www.anthropic.com/news), [DeepSeek](https://huggingface.co/organizations/deepseek-ai/activity/all), [Meta AI](https://ai.meta.com/blog/), [xAI](https://x.ai/news) and [Qwen](https://huggingface.co/organizations/Qwen/activity/all).

Most labs usually have a bunch of useful resources that help deepen your understanding of LLM capabilities.
* Announcement blog posts for an overview
    * Example: [OpenAI o3 announcement post](https://openai.com/index/introducing-o3-and-o4-mini/).
* Official engineering blogs, guides and cookbooks
    * Examples: [Engineering at Anthropic](https://www.anthropic.com/engineering/building-effective-agents), [OpenAI's voice agent guide](https://platform.openai.com/docs/guides/voice-agents?voice-agent-architecture=speech-to-speech), [Gemini Cookbook](https://github.com/google-gemini/cookbook/tree/main/examples/)
* System/Model Cards for more details on the models—expect more detailed information on context windows, benchmarks, safety testing, etc
    * Example: [Claude 4 System Card](https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf)

If you see anyone making an explosive claim about capabilities, or quoting some research from these labs, I like to bypass the person making the claim and read it straight from the source.

A caveat: the cookbooks may not represent the ideal way to do things in my experience, even if they are an excellent starting point. [We're all still figuring this out](https://xcancel.com/seconds_0/status/1935411600829374937). Your own experience of putting AI capabilities into production backed by data trumps everything.

It's occasionally worth keeping tabs on smaller players like [Nous Research](https://nousresearch.com/blog/), [Allen AI](https://allenai.org/blog/olmo2-32B), [Prime Intellect](https://www.primeintellect.ai/), [Pleias](https://pleias.fr/blog), [Cohere](https://cohere.com/blog) and [Goodfire](https://www.goodfire.ai/blog). A lot of them go into technical depth that I don't have the prerequisites to fully understand, but it gave me some sense of what's happening outside the frontier labs and my AI engineering bubble. Interestingly, I have noticed (especially with the first few examples) these labs are willing to talk more about what exactly they are doing compared to frontier labs.

My sources:
* Simon Willison
* Andrej Karpathy
* Algotrained Twitter
* Nato Lambert's interconnected newsletter
* Every
* Official blogs: Anthropic, OpenAI, Meta
* Ethan Mollick
* Chip Huyen
* Eugene Yan
* swyx
* SmolAI twitter roundups
* David Crawshaw
* Janus
* Jeremy Howard
* LessWrong
* Gwern
* Dwarkesh Patel
* Wyatt Walls
* Alexander Doria
* Kwindla Kramer
* Aparna Dhinakaran
* Jo Kristian Bergum
* Erik Meijer
* Omar Khattab
* Jason Liu
* Greg Kamradt
* Gwen Shapira
* Your local AI meetup


AI drive thru issues: https://www.youtube.com/watch?v=TwdduNZJKUM
fake cases: https://arstechnica.com/tech-policy/2023/06/lawyers-have-real-bad-day-in-court-after-citing-fake-cases-made-up-by-chatgpt/
nyc AI chatbot, lawbreaker: https://themarkup.org/news/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law
