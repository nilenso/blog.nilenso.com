---
title: "Tiny Models, Local Throttles: Exploring My Local AI Dev Setup"
kind: article
author: Kiran Gangadharan
created_at: 2025-05-06 00:00:00 UTC
layout: post
---
I’ve been exploring how small, open-source language models can fit into a local development setup to improve how I work day-to-day. There’s something satisfying about building a lightweight, responsive system that runs entirely on your own machine. This post is a practical guide to using tiny models with just enough tooling to throttle things locally, and run smarter without adding complexity.



While the spotlight is on state-of-the-art frontier models, I am interested in exploring the capabilities of open-source models that I can run on my Macbook M2 Pro (10-core CPU, 16GB RAM). Working with open-source models locally is interesting and exciting for a few reasons:



1. \*\*Privacy\*\*: You own the data

2. \*\*Control\*\*: Run on your hardware

3. \*\*Learning\*\*: Understanding what it takes to run a model and the trade-offs

4. \*\*Fine-tuning\*\*: Allows fine-tuning small models with generous resources to make them on-par or better than SOTA models for specific use-cases

5. \*\*Offline\*\*: All of the model’s knowledge made available without an internet connection

6. \*\*Fun!\*\*



I've tried using LLMs in different parts of my workflow, from the terminal to an IDE assistant to an AI-assisted pair programmer.  This guide will help you explore small language models and learn how to integrate them with your day-to-day workflows.



\## Getting started with local models



The two simplest methods to get started with local models are using \[llamafiles](https://github.com/Mozilla-Ocho/llamafile) and \[Ollama](https://ollama.com/).



\*\*Llamafile\*\*



To run a llamafile model, simply download a model tagged with \`llamafile\` from \[HuggingFace](https://huggingface.co/models?library=llamafile) and do the following:



\`\``bash

$ chmod +x <model>.llamafile

$ ./<model>.llamafile

\`\``



This will start a chat and you're good to go. It can’t get any simpler than that.



\*\*Ollama\*\*



Ollama offers an organized approach for managing models, similar to what Docker does for containers (in fact, there are a lot of similarities between the two). To get started, download Ollama for your platform and use it to run a model from their \[registry](https://ollama.com/search) like so:



\`\``bash

$ ollama run llama3.2:3b

\`\``



If you want to just provide a prompt without turning on chat, do this instead:



\`\``bash

$ ollama run llama3.2:3b "why is the sky blue?"

\`\``



You can also list all downloaded models using:



\`\``bash

$ ollama list

\`\``



\## Choosing models to explore



Once you have a medium installed for running models, the next step is to download a model. But which one? There are plenty of options and it is hard to select one. I suggest starting with the following as I’ve found them to be good for regular use:



\- \[llama3.1:8b](https://ollama.com/library/llama3.1:8b)

\- \[qwen2.5:7b](https://ollama.com/library/qwen2.5)

\- \[gemma3:12b](https://ollama.com/library/gemma3:12b)



If you are looking for a model trained on more code, consider exploring:



\- \[qwen2.5-coder:7b](https://ollama.com/library/qwen2.5-coder)

\- \[deepseek-coder-v2:16b](https://ollama.com/library/deepseek-coder-v2:16b)



For image reasoning models, consider:



\- \[llava:13b](https://ollama.com/library/llava:13b)

\- \[llama3.2-vision](https://ollama.com/library/llama3.2-vision)

\- \[moondream](https://moondream.ai/) (a tiny model that packs a punch!)



I’d used a few reasoning models, but not enough to recommend a few, but these are some worth considering:



\- \[deepseek-r1](https://ollama.com/library/deepseek-r1:8b) (distilled from DeepSeek-R1)

\- \[qwen3](https://ollama.com/library/qwen3)



\### Understanding Model Trade-offs



When selecting a local model, there are two key specifications that impact both size and performance:



\*\*Parameters\*\*



The number of parameters (like 8b or 16b) refers to the number of learned values in billions after training a model. More parameters mean more knowledge and better reasoning for the model.



\*\*Quantization\*\*



An optimization to reduce a model’s size by using fewer bits (reducing the floating point precision) to represent weights. Generally represented as Q4_K_M (4-bit), Q8_0 (8-bit), FP32 (original) and such, it provides a trade-off between memory usage and quality. The higher the quantization (Q4 > Q8), the faster the loading and inference, but the lower the output quality.



\*\*Finding the balance\*\*



On my M2 Pro, I’ve found 7/8B models with Q8 quantization and 12-14B models with Q5 or even Q6 quantization to be a good balance between performance and quality. I’d suggest experimenting with these parameters for your hardware to find yours. The process of finding the most bang-for-buck configuration is both educational and fun!



<aside>

💡



You can further customize the model with parameters like context size, temperature or even add to the system prompt by creating a modelfile. See the \[modelfile documentation](https://github.com/ollama/ollama/blob/main/docs/modelfile.md) for more details.



</aside>



\## Better Tooling



Although Ollama provides simple interface for model interaction, it is designed to only work with open-source models. To work with any and every model with a consistent interface, consider using one of these two alternatives:



\- \[simonw/llm: Access large language models from the command-line](https://github.com/simonw/llm)

\- Simple cli interface, lots of useful functionality. Highly recommended.

\- For a better understanding of the features, watch \[Simon's talk](https://www.youtube.com/watch?v=QUXQNi6jQ30&t=2778s)

\- \[open-webui: A UI based AI interface](https://docs.openwebui.com/)

\- For a ChatGPT like user interface for interacting with models

\- Makes it easy to drag-drop documents or images and prompt with them



\### Editor Integration



A simple use-case for having a local model would be to augment your editor workflow. This includes tasks like asking questions without leaving editor, generating, reviewing,  and explaining code, generating documentation, scripts, etc:.



Everyone has their preferred editor workflow and configuration. I’ll walk through my personal setup.



\### Emacs



I've been using  Sergey Kostyaev's \[ellama](https://github.com/s-kostyaev/ellama) for a while now, and it works well. There's also \[jart/emacs-copilot](https://github.com/jart/emacs-copilot) by Justine Tunney, the author of llamafile, which provides copilot-style code completion that works with a llamafile model. I had some issues getting it to work, but it seems worth trying out.



Here's my ellama configuration:



\`\``lisp

(use-package llm

  :straight (:host github :repo "ahyatt/llm"))



(use-package ellama

  :straight (:host github :repo "s-kostyaev/ellama")

  :init

  ;; setup key bindings

  (setopt ellama-keymap-prefix "C-c e")

  (require 'llm-ollama)

  (setopt ellama-provider

\    (make-llm-ollama :chat-model "codestral:latest")))

\`\``



While exploring other setups, I came across \[copilot.el](https://github.com/copilot-emacs/copilot.el) – an Emacs plugin for Github Copilot. Curious to understand how this was made to work, I found the below section in Robert Krahn's \[blog post](https://robert.kra.hn/posts/2023-02-22-copilot-emacs-setup/):



\> Even though Copilot is primarily a VSCode utility, making it work in Emacs is fairly straightforward. In essence it is not much different than a language server. The VSCode extension is not open source but since it is implemented in JavaScript you can extract the vsix package as a zip file and get hold of the JS files. As far as I know, the copilot.vim plugin was the first non-VSCode integration that used that approach. The worker.js file that is part of the vsix extension can be started as a node.js process that will read JSON-RPC data from stdin.

...

An editor like Emacs or VIM can start the worker in a subprocess and then interact with, sending JSON messages and reading JSON responses back via stdout.

\>



Here's the configuration:



\`\``lisp

(use-package copilot

  :straight (:host github :repo "copilot-emacs/copilot.el" :files ("*.el"))

  :config

  ;; (add-to-list 'copilot-major-mode-alist '("enh-ruby" . "ruby"))

  (add-hook 'prog-mode-hook 'copilot-mode)

  (define-key copilot-completion-map (kbd "<tab>") 'copilot-accept-completion)

  (define-key copilot-completion-map (kbd "TAB") 'copilot-accept-completion))



(defvar kg/no-copilot-modes '(shell-mode

\    inferior-python-mode

\    eshell-mode

\    term-mode

\    vterm-mode

\    comint-mode

\    compilation-mode

\    debugger-mode

\    dired-mode-hook

\    compilation-mode-hook

\    flutter-mode-hook

\    minibuffer-mode-hook

\    shell-script-modes)

  "Modes in which copilot is inconvenient.")



(defun kg/copilot-disable-predicate ()

  "When copilot should not automatically show completions."

  (or (member major-mode kg/no-copilot-modes)

\    (company--active-p)))



(add-to-list 'copilot-disable-predicates #'kg/copilot-disable-predicate)



\`\``



I’ve also experimented with integrating Aider using \[aidermacs](https://github.com/MatthewZMD/aidermacs), but haven’t done enough to write about it yet. I’ll update this post when I have.



\### Visual Studio Code



My go-to tool here is \[Cline](https://github.com/cline/cline). Cline is an agentic code assistant that can reason and do tasks like creating/editing files, running commands like tests, automatically fix bugs after running tests etc It can infer the context required to do a task. As a bonus, it also provides the input/output tokens and the cost of each query. Although it works fairly well with local models, using it with a state-of-the-art model like Claude has been a game-changer.



\### IntelliJ Idea



I use the plugin from \[Continue.dev](https://www.continue.dev/) that provides a chat as well as a code completion interface. The chat and code completion models can be configured independently. I use  \[llama3.1:8b](https://ollama.com/library/llama3.1:8b) for the former and \[starcoder2:3b](https://ollama.com/library/starcoder2:3b) for the latter.



\## Evaluating models



Occasionally, you might find yourself wanting to compare responses from different models for a given prompt. You might be curious to see the differences in terms of the content or how something is explained –– if nuances are captured, caveats are mentioned, or if examples are used for illustration.



One tool that I've found useful is \[promptfoo](https://www.promptfoo.dev/). It is designed as a testing framework where a test case containing prompts, a list of models to evaluate and tests is executed and a report is generated. Here's a simple configuration:



\`\``yaml

description: "General Instruction Evaluation"



prompts:

\- "illustrate how {{topic}} works with an example"



providers:

\- "ollama:chat:llama3.1:8b-instruct-q6_K"

\- "ollama:chat:qwen2.5:14b"

\- "ollama:chat:hf.co/unsloth/gemma-3-12b-it-GGUF:Q4_K_M"



tests:

\- vars:

\    topic: dependency injection with Dagger

\- vars:

\    topic: gig economy

\`\``



Once specified, do \`promptfoo eval\` to run the test(s) against the models. The generated report provides a nice tabular representation of the prompt and the model responses, and  looks like this:



<img src="/images/blog/local-llm-setup/promptfoo-ui.png" alt="Promptfoo UI" class="bucket-image" style="margin: auto; text-align:center; max-width: 250px">



This is however \*not\* the right tool if you want to compare and contrast models across a wide variety of use-cases to understand their strengths and flaws. For a more in-depth evaluation, consider using \[lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness#) or \[deepeval](https://github.com/confident-ai/deepeval#js-repo-pjax-container) instead.



\### Public Benchmarks



\[HuggingFace](https://huggingface.co/) maintains a \[open model leaderboard](https://huggingface.co/collections/open-llm-leaderboard/the-big-benchmarks-collection-64faca6335a7fc7d4ffe974a) where it constantly \[evaluates](https://www.notion.so/Tiny-Models-Local-Throttles-Exploring-My-Local-AI-Dev-Setup-14a0f0425dae80a38f98edf7ad5cdf7c?pvs=21) the models hosted on its platform, but it’s slow to load and buggy at times. I’d recommend looking at the following instead:



\- \[LLM-stats](https://llm-stats.com/) for a good overview of model benchmarks and comparisons. It has filters for comparing open models with specific parameters. The visualizations are nice too.

\- \[Aider benchmarks](https://aider.chat/docs/leaderboards/#llm-code-editing-skill-by-model-release-date) particularly for code editing and refactoring

\- \[StackEval](https://www.prollm.ai/leaderboard/stack-eval?type=conceptual,debugging,implementation,optimization&level=advanced,beginner,intermediate&tag=assembly,bash/shell,c,c%23,c%2B%2B,clojure,dart,delphi,elixir,go,haskell,java,javascript,kotlin,objective-c,perl,php,python,r,ruby,rust,scala,sql,swift,typescript,vba) for ability to function as a coding assistant



<aside>

💡



Be wary of taking these benchmarks at face value. They are simply a filter to pick a few starter models to experiment with. Models can train on benchmark data to appear better, so you need to try it for practical purposes in everyday use. Even better if you have your own evaluation dataset to test a model.



</aside>



\## Final Thoughts



There’s still a lot I haven’t tried — newer models, IDE tools, and ideas. But that’s part of the fun. While this setup hasn’t radically transformed my workflow, it has added a few tools to the kit — ones that feel lightweight, local, and surprisingly capable. It’s a starting point for exploring what small models can do in a developer’s everyday environment and I’m curious to see just how far that can go.
