---
title: What are popular coding benchmarks actually measuring?
kind: article
author: Atharva Raykar
created_at: 2025-09-25 00:00:00 UTC
layout: post
---
I dug into popular coding benchmarks while building [StoryMachine](https://blog.nilenso.com/blog/2025/09/15/ai-unit-of-work/#the-storymachine-experiment), an experiment in breaking down software tasks into agent-executable units.

They measure something narrower than what their names suggest. In general, they are [a lot less messy](https://blog.nilenso.com/blog/2025/09/15/ai-unit-of-work/#the-right-sized-unit-of-work-controls-the-propagation-of-errors) than how we write software. This is why Claude scoring 80% on SWE-bench does not translate to Claude one-shotting 80% of the things I throw at it.

Let’s look at what these benchmarks are actually measuring[^selection].

## Table of Contents

- [SWE-bench Verified and SWE-bench Pro](#swe-bench-verified-and-swe-bench-pro)
  - [What it measures](#what-it-measures)
  - [The specifics](#the-specifics)
  - [Verdict](#verdict)
- [Aider Polyglot](#aider-polyglot)
  - [What it measures](#what-it-measures-1)
  - [The specifics](#the-specifics-1)
  - [Verdict](#verdict-1)
- [LiveCodeBench](#livecodebench)
  - [What it measures](#what-it-measures-2)
  - [The specifics](#the-specifics-2)
  - [Verdict](#verdict-2)
- [Other benchmarks](#other-benchmarks)
- [Benchmarking is hard and this makes me bullish on coding agents](#benchmarking-is-hard-and-this-makes-me-bullish-on-coding-agents)
- [References and further reading](#references-and-further-reading)

## SWE-bench Verified and SWE-bench Pro

### What it measures

How well a coding agent can submit a patch for a real-world GitHub issue that passes the unit tests for that issue.

### The specifics

There are many variants: Full, Verified, Lite, Bash-only, Multimodal. Most labs in their chart report on **SWE-bench Verified**, which is a cleaned and human-reviewed subset.

Notes and quirks of SWE-bench Verified:

* It has 500 problems, all in Python. [Over 40% are issues from the Django source repository](https://epoch.ai/blog/what-skills-does-swe-bench-verified-evaluate); the rest are libraries. Web applications are entirely missing.
* Solutions to these issues are small—think surgical edits or small function additions. The mean lines of code per solution are 11, and median lines of code are 4. Amazon found that [over 77.6% of the solutions touch only one function](https://arxiv.org/pdf/2504.08703).
* All the issues are from 2023 and earlier. This data was almost certainly in the training sets. Thus it’s hard to tell how much of the improvements are due to memorisation.

![METR Bar Chart showing SWE-Bench Verified repository distribution](/images/blog/image.png)

Recently, Scale AI published an improved version called **SWE-bench Pro** that tries to address some quirks of Verified. Here are my notes:

* 1865 problems, from 41 repositories. It’s a mix of copyleft/GPL public repositories and some private repositories. I’m skeptical that choosing copyleft would meaningfully combat contamination, given AI labs [are known to resort to piracy to train their models](https://www.bbc.com/news/articles/c5y4jpg922qo). But this is still an improvement.
* The repositories are Python, Go, JS and TS—we don’t know the distribution, except that they are “not uniform”. But they also ensure every repository has only 50-100 problem instances.
* They claim to sample repositories “from a diverse range of topics, including consumer applications with complex UI logic, B2B platforms with intricate business rules, and developer tools with sophisticated APIs”—much better than SWE-Bench Verified. That said, I could not find what this distribution looks like.
* The solutions have a mean of 107 lines of code, and a median of 55 lines of code, and usually span an average of 4 files. Also good.
* They actually got humans to rewrite problems based on issues, commits and PRs to ensure there’s no missing information. They also added “requirements \[that] are grounded on the unit tests that are used for validation”. They may also add interface code for some problems.
* They also have dockerized environments set up with all the dependencies installed and configured, so the benchmark explicitly does not test if your agent can setup your repository.

<details style="margin-top:1em; background-color:#EEE;">
  <summary><strong>An example problem statement from SWE-Bench Pro</strong></summary>

  <article style="padding:12px 16px;">
    <h3>Title: Email Validation Status Not Handled Correctly in ACP and Confirmation Logic</h3>

<p><strong>Description</strong></p>
<p>
  The Admin Control Panel (ACP) does not accurately reflect the email validation status of users.
  Also, validation and confirmation processes rely on key expiration, which can prevent correct
  verification if the keys expire. There’s no fallback to recover the email if it’s not found under
  the expected keys. This leads to failures when trying to validate or re-send confirmation emails.
</p>

<p><strong>Steps to reproduce</strong></p>
<ol>
  <li>Go to ACP → Manage Users.</li>
  <li>Create a user without confirming their email.</li>
  <li>Attempt to validate or resend confirmation via ACP after some time (allow keys to expire).</li>
  <li>Observe the UI display and backend behavior.</li>
</ol>

<p><strong>What is expected</strong></p>
<ul>
  <li>Accurate display of email status in ACP (validated, pending, expired, or missing).</li>
  <li>Email confirmation should remain valid until it explicitly expires.</li>
  <li>Validation actions should fallback to alternative sources to locate user emails.</li>
</ul>

<p><strong>What happened instead</strong></p>
<ul>
  <li>Expired confirmation keys prevented email validation.</li>
  <li>The email status was unclear or incorrect in ACP.</li>
  <li><q>Validate</q> and <q>Send validation email</q> actions failed when the expected data was missing.</li>
</ul>

<p><strong>Requirements</strong></p>
<ul>
  <li>
    The <code>loadUserInfo(callerUid, uids)</code> function should include logic to retrieve and attach
    <code>email:pending</code> and <code>email:expired</code> flags to each user object. These flags must be
    derived by resolving <code>confirm:byUid:&lt;uid&gt;</code> keys via the new <code>getConfirmObjs()</code>
    function and checking <code>expires</code> timestamps in corresponding <code>confirm:&lt;code&gt;</code> objects.
  </li>
  <li>
    The <code>getConfirmObjs()</code> helper within <code>loadUserInfo()</code> should fetch confirmation codes using
    <code>db.mget()</code> on <code>confirm:byUid:&lt;uid&gt;</code> keys, then retrieve the corresponding
    <code>confirm:&lt;code&gt;</code> objects using <code>db.getObjects()</code>. The mapping must ensure each user’s
    confirmation object is accurately indexed by position.
  </li>
  <li>
    Each database adapter MongoDB, PostgreSQL, and Redis, must implement a
    <code>db.mget(keys: string[]): Promise&lt;string[]&gt;</code> method in their respective <code>main.js</code>
    files. This method takes an array of keys and returns an array of corresponding string values.
  </li>
  <li>
    The <code>db.mget</code> implementation should return <code>null</code> for any keys not found. For Redis, use
    <code>client.mget</code>. For MongoDB, query the objects collection with <code>{ _key: { $in: keys } }</code>.
    For PostgreSQL, join <code>legacy_object_live</code> and <code>legacy_string</code> to retrieve values by key.
  </li>
  <li>
    All adapters must preserve input key order and explicitly return <code>null</code> for missing keys.
  </li>
  <li>
    <code>User.validateEmail</code> should retrieve the user’s email using
    <code>user.email.getEmailForValidation(uid)</code> before calling <code>user.email.confirmByUid(uid)</code>.
    If a valid email is found, save it with <code>user.setUserField(uid, 'email', email)</code>.
  </li>
  <li>
    <code>User.sendValidationEmail</code> must use <code>user.email.getEmailForValidation(uid)</code> and pass the
    email explicitly to <code>user.email.sendValidationEmail</code>.
  </li>
  <li>
    When a user account is deleted, invoke <code>User.email.expireValidation(uid)</code> to remove any pending email
    confirmation data.
  </li>
  <li>
    When generating a new confirmation entry <code>confirm:&lt;code&gt;</code>, store an
    <code>expires</code> field as a Unix timestamp in milliseconds in the confirmation object, not a DB-level TTL.
    This timestamp must be used for all future expiry checks.
  </li>
  <li>
    <code>User.email.getEmailForValidation(uid)</code> must first try <code>user:&lt;uid&gt;</code>. If no email is
    set, fallback to the email in <code>confirm:&lt;code&gt;</code> referenced by
    <code>confirm:byUid:&lt;uid&gt;</code>. Only return the email if the UID matches.
  </li>
  <li>
    <code>User.email.isValidationPending(uid, email)</code> must return <code>true</code> only if the confirmation
    object exists, the current time is before <code>expires</code>, and if provided, the email matches.
  </li>
  <li>
    In <code>User.email.canSendValidation(uid, email)</code>, compare the stored TTL timestamp if available
    (or current time if unavailable) plus the configured interval against the max confirmation period to prevent
    excessive resends.
  </li>
</ul>

<p><strong>New interfaces introduced</strong></p>

<p>
  <strong>Type:</strong> Method<br>
  <strong>Name:</strong> <code>db.mget</code><br>
  <strong>Path:</strong> <code>src/database/mongo/main.js</code>, <code>src/database/postgres/main.js</code>, <code>src/database/redis/main.js</code><br>
  <strong>Input:</strong> <code>keys: string[]</code><br>
  <strong>Output:</strong> <code>Promise&lt;(string | null)[]&gt;</code><br>
  <strong>Description:</strong> A batch retrieval method on the database abstraction layer.
</p>

<p>
  <strong>Type:</strong> Function<br>
  <strong>Name:</strong> <code>user.email.getEmailForValidation</code><br>
  <strong>Path:</strong> <code>src/user/email.js</code><br>
  <strong>Input:</strong> <code>uid: number</code><br>
  <strong>Output:</strong> <code>Promise&lt;string | null&gt;</code><br>
  <strong>Description:</strong> Returns the most appropriate email for admin actions like force validate or resend.
</p></article>
</details>

### Verdict

Overall, I think SWE-bench is a good, if still very flawed benchmark (most other benchmarks are a lot worse). I also think SWE-bench Pro addresses some severe problems with Verified (which at this point should just be ignored in any frontier model report). I’ll note that there’s significant drift from what this measures and how I actually work with AI coding agents.

SWE-Bench is measuring how well AI performs on well-defined units of work. So when we say that an agent scores 25% in SWE-bench Pro, we are saying: “In a problem set of well-defined issues with pointed requirements and (the occasional) specification of code interfaces, 25% of the solutions from the agent get the respective problem’s unit test cases to pass”.

This is a useful measurement of progress. But this is not SWE as I understand it—most of the high-leverage parts are in working with product owners to come up with a good specification, translate them into useful interfaces, and then writing secure, maintainable code. With this benchmark we do not have any idea if the code is maintainable, secure, provably correct, or well-crafted—we just know that the unit test cases for it will pass[^utboost].

## Aider Polyglot

### What it measures

If the coding agent (specifically, Aider) can solve hard-level Exercism problems and apply file edits that pass unit tests after at most one round of feedback.

### The specifics

Exercism is a learning platform with “kata-style” programming exercises. It’s not as algorithmic as LeetCode, but still pretty contained.

<details style="margin-bottom:1em; background-color:#EEE;">
  <summary><strong>Example input for Aider Polyglot</strong></summary>
  <article style="padding:12px 16px;">
  <p><strong>Instructions</strong></p>
  <p>
    Your task is to implement bank accounts supporting opening/closing, withdrawals, and deposits of money.
  </p>
  <p>
    As bank accounts can be accessed in many different ways
    (internet, mobile phones, automatic charges), your bank software must
    allow accounts to be safely accessed from multiple threads/processes
    (terminology depends on your programming language) in parallel.
    For example, there may be many deposits and withdrawals occurring in
    parallel; you need to ensure there are no
    <a href="https://en.wikipedia.org/wiki/Race_condition#In_software" target="_blank" rel="noopener">race conditions</a>
    between when you read the account balance and set the new balance.
  </p>
  <p>It should be possible to close an account; operations against a closed account must fail.</p>

  <p><strong>Starting point file: <code>src/main/java/BankAccount.java</code></strong></p>
<div class="language-java highlighter-rouge">
<div class="highlight">
  <pre class="highlight"><code>
class BankAccount {
    void open() throws BankAccountActionInvalidException {
        throw new UnsupportedOperationException("Delete this statement and write your own implementation.");
    }


    void close() throws BankAccountActionInvalidException {
        throw new UnsupportedOperationException("Delete this statement and write your own implementation.");
    }

    synchronized int getBalance() throws BankAccountActionInvalidException {
        throw new UnsupportedOperationException("Delete this statement and write your own implementation.");
    }

    synchronized void deposit(int amount) throws BankAccountActionInvalidException {
        throw new UnsupportedOperationException("Delete this statement and write your own implementation.");
    }

    synchronized void withdraw(int amount) throws BankAccountActionInvalidException {
        throw new UnsupportedOperationException("Delete this statement and write your own implementation.");
    }
}
</code></pre>
</div>

</div>
</article>
</details>

It seems to have far more language diversity than most other popular benchmarks: C++, Java, Go, Python, JavaScript and Rust are covered. The more functional programming languages are still unrepresented.

| Language   | Problems |
| ---------- | -------- |
| C++        | 26       |
| Go         | 39       |
| Java       | 47       |
| JavaScript | 49       |
| Python     | 34       |
| Rust       | 30       |
| **Total**  | **225**  |

Glancing at individual examples, it seems to me that most solutions are in the range of 30-200 lines of code, and spanning at most 2 files.

Like SWE-bench, the evaluation is based on how many unit test cases pass. Everything runs on the Aider harness and prompts.

### Verdict

This is a benchmark that will tell you how good a model is at solving small, tight and well-defined problems. It’s a good measure to check how well a model will perform on Aider across a range of languages. But this is nowhere near a benchmark for SWE (nor does it claim to be). Like SWE-bench, it also only checks unit test case pass rate, which does not account for many aspects of correctness and software quality.

## LiveCodeBench

### What it measures

Python competitive-programming skills under hidden test suites with a rolling, “fresh” problem set. Think LeetCode.

### The specifics

* It consists of the following tasks:

  * Generate solutions to competitive coding problems from scratch.
  * Fix incorrect solutions to coding problems.
  * Predict the output of a function given the code (weird but why not!)
  * Given only the problem statement and test input, predict the output (okay?)
* Everything is Python.
* There’s a fairly even balance between Easy, Medium and Hard problems.
* The evaluations are just like LeetCode: run hidden test cases.
* We know there’s little contamination—only problems released after each model’s cutoff date are evaluated.

  * That said, because it’s LeetCode style, lots of problems will look quite similar to each other.

### Verdict

This isn't a SWE benchmark. This will tell you how good a model is at for solving LeetCode style Python problems, along with a mix of some slightly unusual skills like “mental execution” of code and test case output prediction.

## Other benchmarks

**TerminalBench**: This is interesting because it exclusively focuses on terminal use. So SWE-Bench paired with TerminalBench will give a broader picture of SWE-like capabilities.

**SWE-Lancer**: OpenAI released this earlier in the year, and I thought it was neat because it directly maps the work to economic value by getting the agents to work on Expensify/Upwork tasks. The validation comes from E2E tests rather than unit tests. Unfortunately, their reporting of this benchmark has been quite lowkey since. And nobody is running this benchmark on non-OpenAI models anymore (which I’m curious to see especially since Claude Sonnet 3.5 outshone the o1 model back in the day). There are other flaws with this benchmark. But this framing seems to be in the right direction.

**METR’s Long Horizon Benchmark**: This was an interesting framing, as it considered the time horizons of LLMs working autonomously. They also have a detailed rubric for the “messiness” of a task. I have talked about this benchmark in my article about managing units of work for AI agents.

**Multi-SWE-Bench**: ByteDance made a polyglot benchmark that works similarly to SWE-Bench, that spans seven languages: Java, TypeScript, JavaScript, Go, Rust, C, and C++.

**SWE-Bench Multilingual**: Another polyglot benchmark that spans nine languages, compatible with the SWE-Bench harness. Has data from popular C, C++, Go, Java, JavaScript, TypeScript, PHP, Ruby and Rust repositories.

**HumanEval** (and its variants): An old coding benchmark that should be totally ignored today. The tasks seem to require implementing extremely easy Python toy functions.

## Benchmarking is hard and this makes me bullish on coding agents

A large lesson I took away from studying the specifics of popular benchmarks is that designing a good benchmark is highly labour-intensive. Without human review and annotations, it’s nearly impossible to make a good benchmark. The more sophisticated the benchmark gets, the more it seems to require human intervention to ensure that the tasks are high-quality and not nonsensical or impossible.

And then there are the actual evaluation methods. The way to scale up evaluations is to have automated verification across all tasks. It’s not surprising that most evaluations boil down to “make the unit tests pass” due to this reason. But this will always fall short when it comes to actually benchmarking what I consider the core work of an SWE—which is to translate a problem into structured, verifiable solutions. There is some subjectivity and fuzzy judgement involved around satisfying business needs and timelines, making the right architectural tradeoffs and ensuring the solution is good over a long time horizon.

Considering how state-of-the-art benchmarks fall woefully short of capturing the nuance and messiness of SWE work, the coding agents we have are fantastic. One could imagine how much better they would get once we have better benchmarks (and RL environments) that do a better job than what we have today. I’m not sure about how we’d solve for the more subjective parts, but until recently we didn’t even have good polyglot benchmarks. There’s still a lot of low-hanging fruit. This suggests to me that we are yet to hit any kind of wall for coding abilities in the near future.

On a very short notice, I can already think of a bunch of ideas for what could be improved in benchmarks:

* Validate using generative testing methods, such as PBT or fuzz testing instead of unit tests.
* Use formal methods to check for correctness, where possible.
* Validate answers against automated User Acceptance Criteria checks, where possible.
* Start with product-level documents as the input for the benchmark, such as business context, PRDs and technical specifications. Validate against automated UATs and end-to-end tests.
* Create a benchmark that accounts for the information acquisition and clarification that real SWEs have to do—I could imagine having a benchmark that intentionally does not give all the necessary information up front, and it’s up to the agent to present the required clarifications or search for the necessary context.
* Use well-calibrated human judges to score on the fuzzier criteria of quality (this seems quite hard to do right, and “well-calibrated” is doing a lot of heavy lifting in that sentence).

## References and further reading

**SWE-bench / Verified**  

* [Dataset](https://huggingface.co/datasets/princeton-nlp/SWE-bench)  
* [Leaderboard](https://www.swebench.com/leaderboard)  
* [AWS SWE-bench analysis](https://arxiv.org/pdf/2504.08703)  
* [Original paper](https://arxiv.org/pdf/2306.03093)  

**SWE-bench Pro**  

* [Scale AI blog](https://scale.com/research/swe_bench_pro)  
* [Paper](https://arxiv.org/pdf/2507.02825)  
* [Leaderboard](https://swe-bench-pro.github.io)  

**Aider Polyglot**  

* [Aider blog post](https://aider.chat/2024/12/21/polyglot.html)  

**LiveCodeBench**  

* [Project page](http://livecodebench.github.io/index.html)  

**TerminalBench**  

* [Official site](https://www.tbench.ai/)  
* [Docs](https://docs.tbench.ai)  

**SWE-Lancer**  

* [OpenAI blog](https://openai.com/research/swe-lancer)  
* [Paper](https://arxiv.org/pdf/2502.12115)  

**METR Long-Horizon**  

* [Blog update](https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/)  
* [Paper](https://openreview.net/pdf?id=VTF8yNQM66)  

**Polyglot SWE-bench variants**  

* [Multi-SWE-bench (ByteDance)](https://github.com/bytedance-research/Multi-SWE-bench)  
* [ArXiv paper](https://arxiv.org/abs/2507.02825v2)  
* [Hugging Face dataset](https://huggingface.co/datasets/ByteDance/Multi-SWE-bench)  
* [SWE-bench Multilingual](https://github.com/princeton-nlp/SWE-bench-Multilingual)  

**HumanEval**  

* [Paper](https://arxiv.org/pdf/2107.03374)  
* [GitHub](https://github.com/openai/human-eval)

---

[^selection]: My criteria for covering these specific benchmarks was roughly: look at recent frontier model releases and see what coding benchmarks they report they mention.
[^utboost]: The [UTBoost paper](https://arxiv.org/abs/2506.09289) exposes how a lot of tasks pass unit tests in SWE-Bench without resolving the underlying issues.
