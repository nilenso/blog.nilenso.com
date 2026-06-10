---
title: Our approach to evals with megasthenes
kind: article
author: Siri P R
created_at: 2026-06-10 00:00:00 UTC
layout: post
---
We built megasthenes, an SDK that lets you connect to a GitHub/GitLab repository and ask questions in natural language.

Under the hood, it’s an agentic loop — a model reads the repo with a small set of tools and returns an answer.

It’s important that users trust both the answers and the reasoning behind them. To achieve this, we need to evaluate answers against rubrics and tweak them accordingly. Without any guardrails, an LLM could

- Make claims without grounding them in the code
- Produce incomplete explanations
- Reach premature conclusions
- Skip details that could materially change the answer, such as deprecated code paths, TODO implementations, edge cases, etc.

The moat of megasthenes, over using agents to go over codebases, is building trust in the quality of the answers. In the rest of this post, we’ll explore our approach to improving the usefulness of this SDK. But first, we need to understand what usefulness means before we can evaluate and improve it.

## Principles

1. **Ground every answer in the repository**
    
    The answers should be based directly on the repository and not prior knowledge or assumptions. Every answer should be supported by evidence linked to the relevant code. A repository answer should be inspectable and reproducible against a specific commit.
    
2. **Answers should be cohesive and well reasoned**
    
    Answers should follow cohesive reasoning rooted in evidence. Any claims made should follow logical steps and match any stated conclusions in the answer.
    
3. **Answers should be complete**
    
    Answers should cover the whole question and include the details that matter. If there are multiple parts to a question, all of them should be addressed. Deprecated or legacy paths should be called out explicitly. Important caveats should be highlighted.
    

## Evals: Building guardrails around a non-deterministic system

The evaluation pipeline started as a simple habit of looking at the data and identifying responses that didn’t meet the mark. Over time, we built automations and tooling around it to make the process more efficient, which is covered in greater detail below.

Our first challenge was collecting enough data to evaluate. Using an SDK directly adds friction to testing and using the product. So we vibed a web UI to optimise for usability. This helped us collect a lot of data internally.

![Megasthenes UI](/images/blog/our-approach-to-evals-with-megasthenes/meg_ui.png)

Sessions were persisted in SQLite. Each session contained the repo, commit, question, full tool-call trace, and answer.

This helped us create a dataset of *real* questions instead of having to generate them synthetically.

### Let failures define the rubric

Once we had a sizeable set of user sessions, the next step was to tune the answers to match our “taste”. The first iteration involved manually reading the output, which can be very valuable because there is no substitute for actually inspecting and assessing what the system produced. This helped surface failure modes that later became our rubric.

A handful of observed failure patterns:

- **Missing citations / unsupported claims**
- **Plain-text references instead of links** — `src/foo.ts:42` written as text, rather than as a link back to the actual line in the repo.
- **Over-anchoring / guessed line anchors** — the model forced a line-level citation even when it had only seen the file, fabricating an anchor rather than linking to the file it actually read.
- **Cataloguing instead of explaining** — the answer spent its budget on link-formatting mechanics and surface structure, such as directory listings and config files, but never got to what the code *does*: the design decisions, algorithms, and patterns.
- **Flat treatment of claims** — every statement was held to the same citation bar, so technical claims sometimes went unlinked while trivial structural or qualitative remarks were dragged into strict line-linking.
- **Filler words and repeating the question in the answer**
- **Missing or guessed line numbers** — anchors that pointed to incorrect lines in the code.
- **Ignoring deprecated/legacy paths**
- **Conflating a comment with behaviour** — citing a code comment as ground truth.

Each recurring failure became a measurable change in the form of a concise update to the system prompt or a fix to a tool call:

- **Citations and links —** Add a hard rule such that every technical claim must carry a commit-pinned permalink (`https://github.com/<org>/<repo>/blob/<sha>/path#L42`). Never use a bare path. Relative links, bare paths, and links to *other* repos all fail. For line numbers, link to the most specific location you can *verify* from tool output. `rg` and `read` emit exact line numbers, so you may anchor to them. Don’t over-anchor: if you only used `ls`/`fd`, link to the file with no anchor. **Never estimate a line number.**
- **Deprecated code —** "When code looks deprecated or legacy (`DEPRECATED`/`TODO`/`FIXME`, `legacy_*`/`old_*` names, or a file visibly superseded by a newer one), say so explicitly." This generalised well beyond the config case that surfaced it.
- **Explain functionality instead of structure** — Treat directory/config detail as supporting evidence, not the main story.
- **Appropriate granularity of linking** — Technical claims MUST link to source; structural observations need only a directory/tree link; qualitative judgements need no link, but must follow from linked evidence.

As the number of sessions grew, we needed a way to inspect outputs consistently and provide feedback that was easily available for review.

We built a visualiser to easily go through and annotate the output. We started with a simple custom UI to avoid getting bogged down in the nuances of choosing the right tool.

![Web UI to visualise answers](/images/blog/our-approach-to-evals-with-megasthenes/meg_visualiser.png)

For each session it lays out the repo, commit, latency, the exact commit-pinned system prompt that was sent, every tool call and result in order, token and tool-call counts. An inline annotation panel — a few yes/no checks plus a freeform feedback field — lets you record *why* a response is wrong right next to it.

This step was crucial for building a dataset of questions the SDK typically struggled with. This dataset could then be used as a benchmark for running evals, catching regressions, and measuring improvements.

### Scaling the judgement

Although manual annotation is crucial for setting up a foundation for evals and building a golden dataset, it is hard to scale as the data grows. By this point, the manual review had done its most important job: it had turned vague dissatisfaction into named failure modes. We then encoded those failure modes into a rubric and used an LLM-as-a-judge to apply it automatically.

The LLM judge was designed to take only the question and answer as inputs and return a binary pass/fail verdict, along with feedback for each metric.

Structured output of the judge:
```json
{
  "is_answer_complete":    "yes" | "no",
  "is_evidence_supported": "yes" | "no",
  "is_evidence_linked":    "yes" | "no",
  "is_reasoning_sound":    "yes" | "no",
  "misc_feedback": "..."
}
```

Judge feedback:
![Judge feedback](/images/blog/our-approach-to-evals-with-megasthenes/meg_judge_feedback.png)

We built a simple UI to view the eval output along with a set of metrics that informed our analysis. We also made this interface more ergonomic by adding filters that narrowed the data by repo, verdict, and metric. These small custom capabilities helped us compare results, zoom out, and identify patterns.

![Megasthenes eval viewer](/images/blog/our-approach-to-evals-with-megasthenes/meg_eval_viewer.png)

#### Judgement quality

The LLM judge itself needed refinement based on how well its verdict aligned with the product’s goals.

We observed these gaps in the judge feedback and refined the judge prompt to improve its verdicts and feedback:

- It expected every link to carry a line anchor, even where a file-level link was correct.
- It expected links and explicit evidence for claims that didn’t need them, such as qualitative or structural observations.
- It conflated multiple metrics by treating missing links as missing evidence and unsupported reasoning, causing several metrics to fail because of one issue.

#### Use evals to change behaviour safely

The eval harness enabled us to iterate on the SDK by acting as a regression suite. We made improvements to these:

**Tool calls**

The harness is deliberately minimal. We started with four — `find`, `read`, `grep`, and `ls` — and wanted to swap `find` and `grep` for `fd` and `rg` for speed. 

Having the eval harness in place gave us the confidence to make changes to tool calls that affected core functionality. We leaned on the eval set as a **regression check** by re-running evals against the dataset after the swap.

Some questions exposed a different gap: the agent needed repository history, not just the current tree. That led us to add a read-only `git` tool. This tool had a fixed allow-list of history-only subcommands: `log`, `show`, `blame`, `diff`, `shortlog`, `describe`, `rev-parse`, `ls-tree`, `cat-file`. This meant questions like “what changed between v2 and v3?” could be grounded in git history while safeguarding against inadvertent writes.

**Reasoning**

The judge surfaced these issues:

- **Self-contradiction** — the answer’s opening statement, and sometimes the title, contradicted the reasoning in the rest of the response, or the concluding statement disagreed with the evidence the answer itself laid out.
- **Incorrect assumptions** — conclusions were built on premises the model never verified against the repository.
- **Conclusions unsupported by evidence** — the answer reached a verdict that the code and quotes it presented didn't actually back up.

We tackled these issues with a combination of enabling thinking effort in the model config and improving the system prompt to enforce cohesive reasoning. Re-running the evals confirmed a positive change to the reasoning metric.

## Evolving the observability stack

Storing sessions in our own SQLite database was fine for prototyping, but hand-instrumenting agentic loops, tool calls, and token costs meant reinventing the wheel. We migrated the trace layer to a battle-tested stack: **OpenTelemetry**, with **Arize Phoenix** as the backend. Now every LLM call, tool call, and compaction event is a span. Cost, cache breakdown, and tool-count metrics are readily available. Annotations live alongside traces, with the capability to create datasets for further iterations.

![Observability dashboard](/images/blog/our-approach-to-evals-with-megasthenes/meg_observability.png)

### Resources

- https://hamel.dev/blog/posts/evals-faq/
- https://hamel.dev/blog/posts/llm-judge/
- https://hamel.dev/blog/posts/evals/
- https://arize.com/blog/testing-binary-vs-score-llm-evals-on-the-latest-models/
- Arize Phoenix