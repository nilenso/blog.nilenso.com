---
title: Reinforcement Learning with GRPO
kind: article
author: Kiran Gangadharan
created_at: 2026-01-28 00:00:00 UTC
layout: post
---
Up until early 2024, **Reinforcement Learning with Human Feedback (RLHF)** was the gold standard for post-training models. The [InstructGPT paper](https://arxiv.org/pdf/2203.02155) demonstrates how fine-tuning a small 1.3B model on human feedback using the **Proximal Policy Optimization (PPO)** algorithm can produce outputs that are preferred to those produced by a large 175B model. This process is effective, but operationally heavy, as shown in this diagram from the paper.

![InstructGPT Training Pipeline](/images/blog/instructgpt-pipeline.png "InstructGPT Training Pipeline")

The above process has some drawbacks:

* Data preparation is difficult and labor-intensive
* In a simplified view, RLHF with PPO requires training two models: the policy model, initialized from a base model, and the reward model trained from human preferences. This increases the training complexity and compute/memory resources dramatically.

Is there a more resource-efficient way to train a model?

# Reinforcement Learning with Verifiable Rewards

[DeepSeek's paper](https://arxiv.org/pdf/2402.03300) in early 2024 demonstrated a powerful RL technique using verifiable rewards instead of a learned reward model. This approach was later named **Reinforcement Learning with Verifiable Rewards (RLVR)**. 

The uniqueness of RLVR is in the way it assigns rewards. While RLHF uses a reward model, RLVR uses a verifiable, rule-based mechanism for computing rewards. This works best when correctness can be deterministically checked. For math problems, you can compare with the ground truth. For code generation, you can run tests. The absence of a reward model significantly reduces the computational resources needed and the complexity of the training pipeline. 

The paper also introduced **Group Relative Policy Optimization (GRPO)**, a new policy algorithm that learns by comparing rewards among multiple sampled completions for a prompt. Since it does not require a reward model, it drastically reduces the memory required for training when compared to PPO-based RLHF.

# How GRPO works

As the name suggests, Group Relative Policy Optimization (GRPO) works by computing the relative advantage of completions within a group to inform the model's learning. 

A step in model training using this method can be broken down into the following (simplified) steps:
1. Generate group of completions for a prompt
2. Compute reward for each completion and then compute average reward for the group
3. Compute relative advantage for each completion with respect to the average reward (`prompt_reward - mean_reward`)
4. Compute loss for each completion using its advantage and token log probabilities
5. Compute loss for the group 
6. Aggregate loss across prompts in a batch
7. Compute final loss using the batch aggregate, the learning rate (to control the magnitude of the gradient update) and KL coefficient, the guardrail that prevents the new model from drifting too much from the base model
8. Update parameters to move the model towards completions with higher advantages

This creates a self-improving feedback loop where the model tends to get better every step by using the data from the previous step. Now that we have a high-level view of the process, let's look at an example training pipeline to understand the setup.

# Training with GRPO

Here's an example that trains a small model to generate Python code using [GRPOTrainer](https://huggingface.co/docs/trl/main/en/grpo_trainer) from HuggingFace's [trl](https://huggingface.co/docs/trl/index) library. This is intentionally kept minimal with a single binary reward function and a few samples from the dataset for testing. There is a lot more nuance in designing reward functions and tuning the training parameters for a production setup.

```python
import os
import tempfile
import subprocess

import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM
from trl import GRPOConfig, GRPOTrainer


# This runs unit tests (verifiable reward) and gives 1.0 for pass, 0.0 otherwise.
def reward_fn(prompts, completions, **kwargs):
    """Return 1.0 if the completion passes the provided unit tests else 0.0."""

    tests = kwargs["test"]
    entry_points = kwargs["entry_point"]

    batch_size = len(prompts)
    k = len(completions) // batch_size

    rewards = []
    for i, completion in enumerate(completions):
        j = i // k
        prompt = prompts[j]
        test_code = tests[j]
        entry_point = entry_points[j]

        with tempfile.TemporaryDirectory() as td:
            sol_path = os.path.join(td, "solution.py")
            test_path = os.path.join(td, "test_solution.py")

            with open(sol_path, "w", encoding="utf-8") as f:
                f.write(prompt)
                f.write(completion)
                f.write("\n")

            # Run the dataset's tests against the candidate function.
            with open(test_path, "w", encoding="utf-8") as f:
                f.write(f"from solution import {entry_point} as candidate\n")
                f.write(test_code)
                f.write("\n")
                f.write("check(candidate)\n")

            try:
                proc = subprocess.run(
                    ["python", "-m", "pytest", "-q", test_path],
                    cwd=td,
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                passed = proc.returncode == 0
                rewards.append(1.0 if passed else 0.0)
            except subprocess.TimeoutExpired:
                rewards.append(0.0)

    return rewards


def main():
    train_dataset = load_dataset("openai/openai_humaneval", split="test").select(
        range(10)
    )

    model_name = "Qwen/Qwen2.5-Coder-0.5B-Instruct"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto",
    )

    config = GRPOConfig(
        output_dir="./train_out",
        do_train=True,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=1,
        learning_rate=5e-7,
        num_train_epochs=0.1,
        num_generations=2,
        generation_batch_size=2,
        max_prompt_length=256,
        max_completion_length=64,
        temperature=0.8,
    )

    trainer = GRPOTrainer(
        model=model,
        args=config,
        processing_class=tokenizer,
        train_dataset=train_dataset,
        reward_funcs=reward_fn,
    )

    trainer.train()


if __name__ == "__main__":
    main()
```


Despite the simplicity and efficiency of GRPO, it is not a one-size-fits-all solution. RLVR with GRPO works well for problems that can be deterministically verified, but not for subjective or open-ended tasks like improving prose.

In the next post, I'll walk through a GRPO training experiment for code generation and take a look at different aspects of the pipeline: dataset, reward functions, evals, and lessons learned. More soon. 
