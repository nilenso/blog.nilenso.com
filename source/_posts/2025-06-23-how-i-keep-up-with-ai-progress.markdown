---
title: How I keep up with AI progress (and why you must too)
kind: article
author: Atharva Raykar
created_at: 2025-06-23 00:00:00 UTC
layout: post
---
_Last Updated: 23rd June 2025_

Generative AI has been the fastest moving technology I have seen in my lifetime. Its capabilities also happen to be terribly misunderstood.

Not understanding the capabilities of the technology well enough can lead to disastrous consequences. We have already seen large [companies](https://www.youtube.com/watch?v=TwdduNZJKUM) and even [governments](https://themarkup.org/news/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law) ship dysfunctional or even [dangerous](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/#this-is-a-very-common-problem) AI products. Sufficiently uninformed people [misunderstand how to apply AI](https://arstechnica.com/tech-policy/2023/06/lawyers-have-real-bad-day-in-court-after-citing-fake-cases-made-up-by-chatgpt/) with real and negative consequences.

The most common errors of misunderstanding are either underestimation ("it's all hype") or overestimation ("I don't need programmers anymore"). These patterns are rooted in a lack of a solid understanding of the technology and how it is evolving over time. As technologists, it is our responsibility to deeply understand emerging technology. It's good for business. More importantly, technologists should take responsibility for the consequences of what we build, and that means we must understand what the capabilities of AI are before rushing to ship something.

This is surprisingly challenging. We are in one of the most polluted information environments. If you're not being deliberate about it, you are likely to be exposed to a lot of misinformation that overstates or dismisses the capability of AI.

To help with this, I've curated a list of sources that make up an information pipeline that I consider balanced and healthy. If you're late to the game, consider this a good starting point.

## General guidelines

* Stay close to the source. The further you stray from reading official announcements and write-ups from the AI labs, the more likely you are going to be exposed to noise. Always assume that all reporting is wrong by default, unless it's coming from the primary source, or one of the people listed here.
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

* Director of AI @ Tesla, founding member of OpenAI.
* The best starting point to get an overview of how the models themselves work. His 3.5 hour video is the best million feet overview on the internals of LLMs and surprisingly approachable for relatively non-technical people too.
* Expect:
    * Commentary on the frontier of AI capabilities
    * Approachable explanations on the internals of AI (I haven't gone through all of these yet, but heard praise for his GPT-2 from scratch and zero to hero tutorials)
    * Strong cultural influence and observations on AI impact. He coined the terms "vibe coding" and "jagged intelligence".
* A sample: [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI&pp=ygUIa2FycGF0aHnSBwkJvgkBhyohjO8%3D), [How I Use LLMs](https://www.youtube.com/watch?v=EWvNQjAaOHw&pp=ygUIa2FycGF0aHk%3D)

### [Every's Chain of Thought](https://every.to/chain-of-thought?sort=newest)

* Written by Dan Shipper, the co-founder of Every. I like going through their test runs of the latest frontier models. It's also a good way to get a sense of how these AI models can be used everyday.
* Expect:
    * Practical applications of AI at work
    * Vibe-checks for model capabilities outside of benchmark numbers.
* A sample: [Vibe Check: Codex](https://every.to/chain-of-thought/vibe-check-codex-openai-s-new-coding-agent), [Vibe Check: o3](https://every.to/chain-of-thought/vibe-check-o3-is-out-and-it-s-great)

## Official announcements, blogs and papers from those building AI

Even though these labs sometimes get a bad rap for hyping up AI capabilities, their official announcements have a lot of valuable and generally accurate information on the capabilities of AI.

Always look out for the announcements from [OpenAI](https://openai.com/news/), [Google DeepMind](https://deepmind.google/), [Anthropic](https://www.anthropic.com/news), [DeepSeek](https://huggingface.co/organizations/deepseek-ai/activity/all), [Meta AI](https://ai.meta.com/blog/), [xAI](https://x.ai/news) and [Qwen](https://huggingface.co/organizations/Qwen/activity/all).

Most labs usually have a bunch of useful resources that help deepen your understanding of LLM capabilities.
* Announcement blog posts for an overview
    * Example: [OpenAI o3 announcement post](https://openai.com/index/introducing-o3-and-o4-mini/).
* Official engineering blogs, guides and cookbooks
    * Examples: [Engineering at Anthropic](https://www.anthropic.com/engineering/building-effective-agents), [OpenAI's voice agent guide](https://platform.openai.com/docs/guides/voice-agents?voice-agent-architecture=speech-to-speech), [Gemini Cookbook](https://github.com/google-gemini/cookbook/tree/main/examples/)
* System/Model Cards for more details on the models—expect more detailed information on context windows, benchmarks, safety testing, etc
    * Example: [Claude 4 System Card](https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf)
* Research Papers
    * Examples: [DeepSeek R1's paper about RL](https://arxiv.org/pdf/2501.12948), [Anthropic's On the Biology of a Large Language Model](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)

If you see anyone making an explosive claim about capabilities, or quoting some research from these labs, I always bypass the person making the claim and read it straight from the source, with the surrounding context.

A caveat: the cookbooks may not represent the ideal way to do things in my experience, even if they are an excellent starting point. [We're all still figuring this out](https://xcancel.com/seconds_0/status/1935411600829374937). Your own experience of putting AI capabilities into production backed by data trumps everything.

It's occasionally worth keeping tabs on smaller players like [Nous Research](https://nousresearch.com/blog/), [Allen AI](https://allenai.org/blog/olmo2-32B), [Prime Intellect](https://www.primeintellect.ai/), [Pleias](https://pleias.fr/blog) (open source, open research), [Cohere](https://cohere.com/blog) (enterprise) and [Goodfire](https://www.goodfire.ai/blog) (interpretability research). A lot of them go into technical depth that I don't have the prerequisites to fully understand, but it gave me some sense of what's happening outside the frontier labs and my AI engineering bubble. Interestingly, I have noticed (especially with the first few examples) these labs are willing to talk more about what exactly they are doing compared to frontier labs.

## Practitioners and tool builders

These are people who have contributed to the AI Engineering ecosystem in various ways, either by building open source tooling or putting in the work of integrating these AI models. Often, I've found more detailed and helpful recommendations than what the official cookbooks and guides suggest.

### [Hamel Husain](https://hamel.dev/)

* Machine Learning Engineer, runs a consultancy. Contributed to a few ML tools.
* Expect:
    * Great write-ups on evals and continuously improving AI systems.
    * Notes on using libraries while building AI tools.
* A sample: [Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/), [LLM Eval FAQ](https://hamel.dev/blog/posts/evals-faq/)

### [Shreya Shankar](https://www.sh-reya.com/)

* Researcher at UC Berkeley. Has been writing about AI engineering the last few years.
* Expect:
    * Great write-ups on evals and continuously improving AI systems.
    * Field notes, musings, experiments
* A sample: [Data Flywheels for LLM Applications](https://www.sh-reya.com/blog/ai-engineering-flywheel/), [Short Musings on AI Engineering and "Failed AI Projects"](https://www.sh-reya.com/blog/ai-engineering-short/)

### [Jason Liu](https://jxnl.co/)

* Independent consultant, ML Engineer, creator of [Instructor](https://python.useinstructor.com/).
* Expect:
    * Detailed write-ups on RAG, evals and continuously improving AI systems.
    * AI consulting guides (especially for indie consultants)
* A sample: [The RAG Playbook](https://jxnl.co/writing/2024/08/19/rag-flywheel/), [Common RAG Mistakes](https://jxnl.co/writing/2024/01/07/inverted-thinking-rag/)

### Eugene Yan [(link)](https://eugeneyan.com/)

* Principal Applied Scientist at Amazon, specialises in RecSys, currently working on LLM systems.
* Expect:
    * Detailed write-ups on LLMs, digging a bit more into ML/Language Model fundamentals and the math behind it.
    * Write-ups on side projects and prototypes
* A sample: [Task-Specific LLM Evals that Do & Don't Work](https://eugeneyan.com/writing/evals/), [AlignEval](https://eugeneyan.com/writing/aligneval/), [Intuition on Attention](https://eugeneyan.com/writing/attention/)

### What We’ve Learned From A Year of Building with LLMs [(link)](https://applied-llms.org/)

* This is an ensemble of practitioners who have written down everything they've learnt about building with LLMs. Includes all the practitioners mentioned above!

### Omar Khattab (link to [website](https://omarkhattab.com/) and [twitter](https://x.com/lateinteraction))

* Research Scientist at Databricks, creator of DSPy.
* Expect:
    * Write-ups on better abstractions than prompts (DSPy addresses this)
    * Commentary on emerging research
* A sample: [A Guide to Large Language Model Abstractions](https://www.twosigma.com/articles/a-guide-to-large-language-model-abstractions/), [twitter post on better abstractions for AI apps](https://x.com/lateinteraction/status/1921565300690149759)

### Kwindla Kramer

* 


Sources to expand on:
* ~~Simon Willison~~
* ~~Andrej Karpathy~~
* Algotrained Twitter
* Nato Lambert's interconnected newsletter
* ~~Every~~
* ~~Official blogs: Anthropic, OpenAI, Meta~~
* Ethan Mollick
* Chip Huyen
* ~~Eugene Yan~~
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
* ~~Omar Khattab~~
* ~~Jason Liu~~
* Greg Kamradt
* Gwen Shapira
* Your local AI meetup

