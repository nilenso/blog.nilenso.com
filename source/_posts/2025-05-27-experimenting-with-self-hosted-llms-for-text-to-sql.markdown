---
title: Experimenting with Self-Hosted LLMs for Text-to-SQL
kind: article
author: Yogiraj Hendre
created_at: 2025-05-27 00:00:00 UTC
layout: post
---
Local large language models (LLMs) are quickly becoming viable for real-world tasks. After reading [Kiran's blog](https://blog.nilenso.com/blog/2025/05/06/local-llm-setup/) on self-hosting them, I decided to try it out myself. Since I was already working on the Text-to-SQL problem with Sezal and Tarun, it seemed like the perfect task to benchmark local models.

## Why Local LLMs?

- What inspired me was the control — I could choose which model to run, tweak parameters, test different quantizations, and see how it all affects performance.
- I was curious about how an LLM is loaded onto a GPU, how Ollama handles model execution, and how it uses `llama.cpp` internally.

I hadn't run local models before and this was my first attempt. I had previously tried Simon Willison’s [LLM tool](https://github.com/simonw/llm), but not for running models locally.

## Setting Up Ollama

I set up [**Ollama**](https://ollama.com/) to run the models. Since the machine running the models is at home and I work from my office, I used [**Tailscale**](https://tailscale.com/) to expose the Ollama API securely over a VPN. This setup let me call the local model API as if it were cloud-hosted — from anywhere.

### Choosing Which Model to Run

- I started by browsing online forums to see which models were commonly used for code generation. **DeepSeek** and the **Qwen 2.5** family stood out.
- A key factor was model size and VRAM requirements. Since I’m using a **16GB RX 7800XT** GPU, I needed models that would fit in VRAM without bottlenecks.

### Running the Models

It is quite easy to run a model in Ollama. You just need to say
```
ollama run qwen2.5-coder
```
and the model will be up and running in a matter of minutes. You can also interact with the model in the same terminal, or over an HTTP API that ollama exposes. 

I initially tried the DeepSeek R1, but it did not perform as well as I’d hoped, it kept generating invalid SQL. So I switched to Alibaba’s **Qwen 2.5 Coder** models and also tested [**DeepCoder**](https://www.together.ai/blog/deepcoder), a fine-tuned variant of DeepSeek.

### Agentic Workflow

I wrote a custom script to interact with multiple LLMs in an agentic workflow. In the script, you can specify the provider (e.g., OpenAI, Google, Anthropic, Ollama) and select the model to use. I initially used only cloud-based APIs like Gemini, Claude, and ChatGPT — but adding Ollama as a provider was seamless, and I could run whichever model I want. You can find the code [here](https://github.com/nilenso/agentic-sql-generator).

## Text-to-SQL

### Why Text-to-SQL?

It's well-benchmarked, and there's a long history of novel techniques that help you evaluate model saturation and reasoning depth. It also provides an excellent way to evaluate real-world utility, especially for structured data tasks.

### The Prompt

```python
prompt = f"""
    Given the following question: "{question}"

    And the following database table definitions:
    {table_ddls}

    Generate a valid sqlite query that answers this question.
    Ensure the query is syntactically correct and uses only the tables and columns defined above.

    The query should only return the exact column(s) necessary to answer the question. Avoid including extra data unless it's the answer.

    Return your response strictly in the JSON format, with the following fields:
      "query": "your sqlite query here",
      "explanation": "a brief explanation of how the query answers the question"

    Important: Return ONLY the raw JSON object without any markdown formatting, code blocks, or additional text.
    """

    # Add evidence to the prompt if provided
    if evidence:
        prompt += f"""

    Additional evidence to consider:
    {evidence}
    """

```

This is the final prompt. Initially, I was directly adding the `CREATE TABLE` command returned by sqlite in the prompt, but later I switched to using the column definitions provided in the csv files of the bird-bench dataset. 

After testing with a few models, I realized that the **Qwen 2.5 Coder** gives the best performance as compared to the model size and response times. DeepSeek R1 had struggled to generate valid SQL, but the finer tuned models like DeepCoder performed surprisingly well.

## Results

### Model Performance Snapshot:

Set of 5 easy questions, to get an idea of response times for each model/size/quantization.

| Model Name | Parameters | Quantization | VRAM Usage | Response Time |
| --- | --- | --- | --- | --- | 
| **Qwen2.5-Coder** | 14B | Q4_K | 9GB | **2–5s** |
| Qwen2.5-Coder | 14B | Q8_0 | 15.6GB | 6–11s |
| Qwen2.5-Coder | 32B | Q4_K | 19.8GB | 9–47s |
| DeepCoder | 14B | Q4_K | 10GB | 17–120s |

### Benchmark 1: 50 Easy Text-to-SQL Tasks
The actual SQL output is available in the github repo [here](https://github.com/nilenso/agentic-sql-generator).

| Model Name | Parameters | Quantization | SQL Accuracy |
| --- | --- | --- | --- |
| Qwen2.5-Coder | 32B | Q4_K | 48% |
| Qwen2.5-Coder | 14B | Q4_K | 46% |
| Qwen2.5-Coder | 14B | Q8_0 | 50% |
| Qwen2.5-Coder | 32B | Q8_0 | 50% |
| Devstral | 24B | Q8_0 | 54% |

## What I Learned

- Local LLMs can achieve **comparable accuracy to ChatGPT** on easy and moderate Text-to-SQL tasks.
- **Prompt engineering** is critical — lean, clear, structured prompts made a noticeable difference.
- **VRAM is the hard limit** — 16GB was just enough to run 14B models comfortably with quantization.
- **Quantization** plays a huge role in running models efficiently. Using 4-bit versions made the difference between a responsive and unusable setup, with minimal impact on performance.
- Although quantized models were quick, they were **less accurate** while generating SQL.
- Tools like Ollama **abstract away a lot of the infrastructure overhead**, making it surprisingly easy to test local models with an API-style interface.

## What’s Next?

- Run full **BirdBench** benchmarks with latency metrics and SQL match scoring.
- Experiment with **quantized versions of even larger coding models**.
- Explore **fine-tuning smaller models** for SQL-specific generation tasks.
- Compare **Ollama with other runners** like LM Studio, LocalAI, and others.

---
