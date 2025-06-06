---
title: Experimenting with Self-Hosted LLMs for Text-to-SQL
kind: article
author: Yogiraj Hendre
created_at: 2025-05-27 00:00:00 UTC
layout: post
---

After reading [Kiran's blog](https://blog.nilenso.com/blog/2025/05/06/local-llm-setup/) on self-hosting LLMs, I decided to try it out myself to see how viable local LLMs are, for real world tasks. Since I was already working on the Text-to-SQL problem with Sezal and Tarun, it seemed like the perfect task to test that out.

## Key Takeaways

- Local LLMs achieve **comparable accuracy to frontier models** on easy and moderate Text-to-SQL tasks.
- **VRAM is the hard limit** — 16GB was just enough to run 14B models comfortably with quantization.
- Tools like Ollama **abstract away a lot of the infrastructure overhead**, making it surprisingly easy to test local models with an API-style interface.
- Prompt minimalism (+JSON schema) bought ~5 % accuracy.  

## Why Local LLMs?

- What inspired me was the control — I could choose which model to run, tweak parameters, test different quantizations, and see how it all affects performance.
- I was curious about how an LLM is loaded onto a GPU, how Ollama handles model execution, and how it uses `llama.cpp` internally.

I hadn't run local models before and this was my first attempt. I had previously tried Simon Willison’s [LLM tool](https://github.com/simonw/llm), but not for running models locally.

## The Setup

### Hardware & Runner  

16 GB RX 7800 XT, Ollama + Tailscale.  

### Dataset & Prompt  

BirdBench subset (link). Final prompt shown here.  

### Models Tested  

Qwen 2.5-Coder (14 B & 32 B, Q4_K/Q8_0), DeepCoder, Devstral.

### Agentic Workflow

I wrote a custom script to interact with multiple LLMs in an agentic workflow. In the script, you can specify the provider (e.g., OpenAI, Google, Anthropic, Ollama) and select the model to use. I initially used only cloud-based APIs like Gemini, Claude, and ChatGPT — but adding Ollama as a provider was seamless, and I could run whichever model I want. [You can find the code here](https://github.com/nilenso/agentic-sql-generator).

## Results

### Model Performance Snapshot

Set of 5 easy questions, to get an idea of response times for each model/size/quantization.

| Model Name | Parameters | Quantization | VRAM Usage | Response Time |
| --- | --- | --- | --- | --- |
| **Qwen2.5-Coder** | 14B | Q4_K | 9GB | **2–5s (fastest)** |
| Qwen2.5-Coder | 14B | Q8_0 | 15.6GB | 6–11s |
| Qwen2.5-Coder | 32B | Q4_K | 19.8GB | 9–47s |
| DeepCoder | 14B | Q4_K | 10GB | 17–120s |

### Benchmark 1: 50 Easy Text-to-SQL Tasks

The actual SQL output is available in the [github repo here](https://github.com/nilenso/agentic-sql-generator).

| Model Name | Parameters | Quantization | SQL Accuracy |
| --- | --- | --- | --- |
| **Devstral (Best so far)** | 24B | Q8_0 | **54%** |
| Qwen2.5-Coder | 14B | Q8_0 | 50% |
| Qwen2.5-Coder | 32B | Q8_0 | 50% |
| Qwen2.5-Coder | 32B | Q4_K | 48% |
| Qwen2.5-Coder | 14B | Q4_K | 46% |

## Interpretation

- **Quantization** plays a huge role in running models efficiently.
- Using 4-bit versions made the difference between a responsive and unusable setup, with minimal impact on performance.
- Although quantized models were quick, they were **less accurate** while generating SQL.

---
