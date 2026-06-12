---
title: Building the systems that build the software
kind: article
author: Atharva Raykar
created_at: 2026-06-12 00:00:00 UTC
layout: post
---
<style>
.annotated-talk-slide { margin: 2.4rem 0 3rem; border-top: 1px solid #e6e6e6; padding-top: 1.25rem; }
.annotated-talk-slide img { display: block; width: 100%; height: auto; border: 1px solid #e6e6e6; box-sizing: border-box; }
.annotated-talk-slide > div { margin-top: 0.85rem; }
.annotated-talk-slide .timestamp { color: #666; font-size: 0.92rem; font-family: var(--font-sans); margin-bottom: 0.4rem; }
.annotated-talk-slide .permalink { float: right; text-decoration: none; border-bottom: none; padding-left: 1em; color: #777; }
</style>

I gave this talk at The Fifth Elephant 2026 in Pune. This is an annotated version of the talk: each slide or screen is followed by a lightly edited transcript of what I said around that point.

The transcript is edited for readability: filler words, repeated fragments, and obvious captioning mistakes have been removed, while preserving the original wording and flow as closely as possible.

<div class="annotated-talk-slide" id="slide-01">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-01.jpg" alt="building the systems that build the software" style="max-width: 100%">
  <div><a class="permalink" href="#slide-01">#</a>
  <p class="timestamp">00:00-00:54.</p>
  <p>Before I begin, I wanted to get a quick poll, just to get a sense of what tools people are using. How many of you are Claude Code users? A couple. What about Copilot? Okay, a lot more Copilot. Codex? Okay, one Codex. Anything else I did not mention? That seems to cover just about everything. I think all of you have used agentic tools, and I am going to talk about building the systems that build the software.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-02">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-02.jpg" alt="This is an exploration of the new skills for the transformed SWE role" style="max-width: 100%">
  <div><a class="permalink" href="#slide-02">#</a>
  <p class="timestamp">00:54-01:09.</p>
  <p>In light of all of these coding tools writing most of our code, this is going to be an exploration of what we must do now. What are the new skills we require for this transformed SWE role?</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-03">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-03.jpg" alt="It is very easy to confuse the essence of what you are doing with the tools you are using" style="max-width: 100%">
  <div><a class="permalink" href="#slide-03">#</a>
  <p class="timestamp">01:09-01:33.</p>
  <p>It is very easy to confuse the essence of what you are doing with the tools you are using. As Abelson has argued, software engineering is not really about code. It is not even really about computers. Our job is to formalize intuition about process, or about how to do things.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-04">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-04.jpg" alt="Formalising intuitions about process" style="max-width: 100%">
  <div><a class="permalink" href="#slide-04">#</a>
  <p class="timestamp">01:33-01:51.</p>
  <p>There is some implicit knowledge that we have to make explicit by encoding various representations of the relevant aspects of the world and handling edge cases. That gives us code that does things.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-05">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-05.jpg" alt="LLMs already do many parts of this better than the median programmer" style="max-width: 100%">
  <div><a class="permalink" href="#slide-05">#</a>
  <p class="timestamp">01:51-02:06.</p>
  <p>This is the part that LLMs are now doing really well. I would argue that many parts of this are being done better than the median programmer.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-08">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-08.jpg" alt="Formalise this process to value" style="max-width: 100%">
  <div><a class="permalink" href="#slide-08">#</a>
  <p class="timestamp">02:06-02:24.</p>
  <p>So what is our job here? We still formalize intuitions about a process. That has not changed. But the process is different: it is now the process of managing a sociotechnical system and orchestrating code production so that it creates value. That could be business value, impact on the world, and so on.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-09">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-09.jpg" alt="Our concern is the same: complexity" style="max-width: 100%">
  <div><a class="permalink" href="#slide-09">#</a>
  <p class="timestamp">02:24-02:33.</p>
  <p>Just like before the whole change with AI, our concern is the same: complexity.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-10">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-10.jpg" alt="New forms of complexity" style="max-width: 100%">
  <div><a class="permalink" href="#slide-10">#</a>
  <p class="timestamp">02:33-03:18.</p>
  <p>This time we have to contend with new forms of complexity. There is stochasticity: randomness, unpredictability, the chance-driven nature that comes from LLMs. There is non-determinism, where there are multiple possible outputs for the same input. There is jaggedness, which Claude Code users will have noticed: sometimes the model is good, and sometimes it is absolutely bad, and it is not clear in advance which one you are going to get. And obviously, you have to manage risk. Sometimes things blow up. What do you do when that happens?</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-12">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-12.jpg" alt="The Fuzz" style="max-width: 100%">
  <div><a class="permalink" href="#slide-12">#</a>
  <p class="timestamp">03:18-03:33.</p>
  <p>I like to characterize all of these forms of complexity as “the fuzz”: this big, hairy cloud of unknowing, of not being sure what you are going to get. How do we deal with it? For this, I propose three skills.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-16">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-16.jpg" alt="Systems thinking serves us well because it helps us understand structure that generates behaviour" style="max-width: 100%">
  <div><a class="permalink" href="#slide-16">#</a>
  <p class="timestamp">03:33-03:54.</p>
  <p>Our first skill is systems thinking. Systems thinking serves us well because it helps us understand how structure generates behavior. What is important in a world where you are dealing with the fuzz is that behavioral patterns are more important than any specific event or precise parameter.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-17">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-17.jpg" alt="Structural intuition" style="max-width: 100%">
  <div><a class="permalink" href="#slide-17">#</a>
  <p class="timestamp">03:54-04:09.</p>
  <p>Systems thinking gives us structural intuition. When you know the structure and the patterns of behavior it generates, you are able to work better with the fuzz.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-18">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-18.jpg" alt="A system is an interconnected set of elements coherently organised in a way that achieves something" style="max-width: 100%">
  <div><a class="permalink" href="#slide-18">#</a>
  <p class="timestamp">04:09-04:48.</p>
  <p>What is a system? Let me be more specific. A system is an interconnected set of elements, coherently organized in a way that achieves something. In this case, our system will consist of stocks, which you can think of as buffers or quantities that can increase or decrease; inflows and outflows, which are valves that increase or decrease the quantity in a buffer; and loops, which we will see now.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-19">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-19.jpg" alt="Code Review Subsystem" style="max-width: 100%">
  <div><a class="permalink" href="#slide-19">#</a>
  <p class="timestamp">04:48-06:09.</p>
  <p>Let us take an example of a system we are very familiar with: the code review backlog. Our stock is the white box in the center: the number of backlog items, or the number of PRs that need to be reviewed. We have an inflow and an outflow. The number of PRs raised increases the quantity in the code review backlog, and resolving PRs decreases that buffer. There are two loops here, B1 and B2. These are balancing loops that happen in response to information. If the backlog is high, a team lead might ask the team to stop some feature development because code review is the bottleneck. You prioritize code reviews, increase the outflow, and bring the backlog down. Similarly, once the backlog is small and we do not need so many people prioritizing review, we can deprioritize it.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-20">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-20.jpg" alt="Equilibrium chart" style="max-width: 100%">
  <div><a class="permalink" href="#slide-20">#</a>
  <p class="timestamp">06:09-06:33.</p>
  <p>That brings the backlog back toward an equilibrium. If the review backlog is low, it eventually goes up to the equilibrium point. If it is high, it goes down to the same point, because we have two competing balancing feedback loops.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-21">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-21.jpg" alt="Code Review Subsystem with perception delays" style="max-width: 100%">
  <div><a class="permalink" href="#slide-21">#</a>
  <p class="timestamp">06:33-06:54.</p>
  <p>But here is something that deepens the model: we do not respond instantaneously. When you see the backlog metric, especially if you are checking it weekly, the time it takes to reallocate capacity amounts to a perception delay. Both of these feedback loops have that delay.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-22">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-22.jpg" alt="Oscillation due to perception delay" style="max-width: 100%">
  <div><a class="permalink" href="#slide-22">#</a>
  <p class="timestamp">06:54-07:36.</p>
  <p>That leads to a pattern like this: oscillation. Oscillation is closely linked to delays. Why does it happen? If you over-prioritize code reviews, you overcorrect and the backlog goes down a lot. The next week you say, “We put too much bandwidth on code review, let us shift it back.” Then it overcorrects the other way, and so on, until it reaches equilibrium. This is a toy model; code review has more nuance. But it helps build structural intuition.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-23">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-23.jpg" alt="So let us react faster and tighten the feedback loop?" style="max-width: 100%">
  <div><a class="permalink" href="#slide-23">#</a>
  <p class="timestamp">07:36-08:00.</p>
  <p>One common reaction to oscillation is to tighten the feedback loop. Oscillation causes chaos and instability, and nobody wants to work with that, so we say: maybe we should react faster. Instead of checking the code review backlog every week, let us do it every day.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-24">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-24.jpg" alt="Faster reaction causing more oscillation" style="max-width: 100%">
  <div><a class="permalink" href="#slide-24">#</a>
  <p class="timestamp">08:00-08:51.</p>
  <p>You get something unintuitive. The dark red line is what happens when you react to the metric more often, say every day instead of every week. The reason you see a more drastic oscillation is that you are overcorrecting with much more force. What you were supposed to do was the opposite. This intuition does not come clearly unless you work with these systems often. Another analogy is a hot shower: there is a perception delay when you turn the hot knob. The faster you react, the more you oscillate between too hot and too cold, and you suffer a lot in the shower.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-25">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-25.jpg" alt="AI agents increasing PR inflow" style="max-width: 100%">
  <div><a class="permalink" href="#slide-25">#</a>
  <p class="timestamp">08:51-09:21.</p>
  <p>Now that we have AI agents, Claude Code, and Copilot, the number of PRs raised can lead to a much faster inflow into the code review backlog buffer. But the outflow is usually not affected. I hope it is not, because you are actually looking at and reviewing all the code.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-26">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-26.jpg" alt="Wilder oscillation with AI agents" style="max-width: 100%">
  <div><a class="permalink" href="#slide-26">#</a>
  <p class="timestamp">09:21-09:39.</p>
  <p>What happens when we introduce AI agents as our main mechanism for producing pull requests? Wilder oscillations. Again, you are overcorrecting for an increased amplitude, which leads to wider swings. What is more interesting is that the equilibrium point for the backlog moves up.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-27">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-27.jpg" alt="Debt loops" style="max-width: 100%">
  <div><a class="permalink" href="#slide-27">#</a>
  <p class="timestamp">09:39-10:39.</p>
  <p>Let us talk about a different system: technical debt. We are all familiar with technical debt. It works sort of like real debt. Unlike the previous system, the technical debt stock has a balancing loop and a reinforcing feedback loop. What the reinforcing loop reinforces is technical debt. The more technical debt there is, the more it affects the inflow of defects into your code, because a codebase that is harder to work with is likely to produce more bugs because nobody understands it. At some point, technical debt grinds everything to a halt, at which point you have to reallocate a lot of work. You do that rework with a balancing feedback loop while halting actual useful progress.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-28">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-28.jpg" alt="Technical debt exponential" style="max-width: 100%">
  <div><a class="permalink" href="#slide-28">#</a>
  <p class="timestamp">10:39-11:12.</p>
  <p>This kind of chart turns exponential, because reinforcing feedback loops tend to dominate balancing feedback loops. If the AI-agent valve is turned up, as it often is, the exponential is steeper: the more code there is, the more technical debt there is, and the more technical debt there is, the more it loops on itself and increases faster.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-29">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-29.jpg" alt="One lever: adjust the units of work" style="max-width: 100%">
  <div><a class="permalink" href="#slide-29">#</a>
  <p class="timestamp">11:12-12:12.</p>
  <p>What can we do about this? One idea that has helped in my experience is adjusting the units of work. Every piece of work can be characterized as a task or a story. If you have a very large chunk of work that you give to an agent at one time, it is harder to verify because it is a big ambiguous blob. Verification also takes a lot of time, even if you do it. So I propose breaking a story down into smaller chunks. This is already present in our story literature: we use acceptance criteria, and we say we can only move on to the next thing once the small unit of work passes its acceptance criteria. That creates a checkpoint that keeps the technical debt stock under control.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-30">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-30.jpg" alt="Demo time: a toy system" style="max-width: 100%">
  <div><a class="permalink" href="#slide-30">#</a>
  <p class="timestamp">12:12-12:27.</p>
  <p>Let us bring some of this together. I made a little demo of a toy system with Claude. If anything goes wrong, you can blame Claude. But the parameters I modeled are things I have definitely checked.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="demo-01">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/demo_00-12-45_screen.jpg" alt="Live demo system diagram and tanks" style="max-width: 100%">
  <div><a class="permalink" href="#demo-01">#</a>
  <p class="timestamp">12:45-13:30.</p>
  <p>The system diagram combines the things we have seen. We have a debt stock, value shipped as a stock, and reusable knowledge. Hidden debt has a compounding feedback loop. We have a rework tax, which is the balancing feedback loop I showed earlier. The agent produces a good amount of useful work, but also produces defects, which go into the hidden debt stock. Another balancing loop converts hidden debt into value shipped. Reusable knowledge is also a reinforcing feedback loop: good commit messages, documentation, and architecture decision records help an agent avoid making mistakes in the future.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="demo-02">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/demo_00-13-30_screen.jpg" alt="Live demo charts" style="max-width: 100%">
  <div><a class="permalink" href="#demo-02">#</a>
  <p class="timestamp">13:30-14:15.</p>
  <p>In this tool I can set parameters like task granularity, the size of our unit of work, the amount of documentation we are producing, and agent speed. This is a toy model. What matters is gaining structural intuition, not a specific parameter. When I play it out, you can see the tanks filling accordingly. If I turn up the agent speed, the charts change. The charts correspond to the stocks shown earlier.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="demo-03">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/demo_00-14-15_screen.jpg" alt="Live demo hidden debt rising" style="max-width: 100%">
  <div><a class="permalink" href="#demo-03">#</a>
  <p class="timestamp">14:15-15:15.</p>
  <p>Here we have pretty large monolithic tasks and low verification rigor. Because of this, hidden debt increases quite a bit, value shipped flatlines, and net velocity goes down. Now suppose I am building the next cool B2B SaaS and my team lead asks all of us to start working on it. A common default is high agent speed, but not enough work put into breaking tasks down into small useful units. If we play that out, net velocity shoots up and then starts falling precipitously, because we are accumulating technical debt. Some output flows into hidden debt and some into actual value, so while we are shipping value, velocity decreases.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="demo-04">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/demo_00-15-15_screen.jpg" alt="Live demo changing granularity and documentation" style="max-width: 100%">
  <div><a class="permalink" href="#demo-04">#</a>
  <p class="timestamp">15:15-16:15.</p>
  <p>At this point the team lead asks me for advice, and I say: we should break our work down into small units. Let us make tasks more granular, and slow things down a bit so that we can rework hidden debt. They might increase documentation as well. When I do that, net velocity stops falling, but as you can see, it is not increasing either. That is because we were off to a bad start. Hidden debt is still accumulating, even if the rate at which it accumulates has slowed down. That is the problem with the reinforcing feedback loop.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="demo-05">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/demo_00-16-15_screen.jpg" alt="Live demo oscillation between modes" style="max-width: 100%">
  <div><a class="permalink" href="#demo-05">#</a>
  <p class="timestamp">16:15-16:57.</p>
  <p>At this point, the team lead says, “Your suggestions do not work. In fact, we have gone slower since we applied them. I am going to do the thing that gave us velocity early on: turn up the speed and not waste time breaking down tasks or maintaining verification rigor.” When we continue there, there is a slight jump, but we crash harder because we have accelerated hidden debt again. You can see this play out as oscillation between these two modes. It creates instability, and value shipped flatlines anyway. If we practiced the structural intuition I am talking about, we would do much better. That is why systems thinking is useful.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-31">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-31.jpg" alt="Homework feedback loops" style="max-width: 100%">
  <div><a class="permalink" href="#slide-31">#</a>
  <p class="timestamp">16:57-17:27.</p>
  <p>Some homework: I talked about a few specific loops related to hidden debt and code review, but we have a lot more feedback loops throughout the software engineering lifecycle. Think about product release, working with users, and operating the product. How many feedback loops are there, and how can you apply structural intuition to model useful behavior?</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-32">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-32.jpg" alt="Summarising systems thinking" style="max-width: 100%">
  <div><a class="permalink" href="#slide-32">#</a>
  <p class="timestamp">17:27-17:42.</p>
  <p>To summarize the skill: complex, goal-seeking, fuzzy systems have observable behavioral properties. Observing these well helps us deal with the fuzz.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-35">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-35.jpg" alt="Environment design intro" style="max-width: 100%">
  <div><a class="permalink" href="#slide-35">#</a>
  <p class="timestamp">17:42-17:54.</p>
  <p>But we also want to influence the loops I was talking about earlier. This is where environment design helps us. It helps us influence the feedback loops that give these systems their power.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-36">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-36.jpg" alt="Environment design modifies systems" style="max-width: 100%">
  <div><a class="permalink" href="#slide-36">#</a>
  <p class="timestamp">17:54-18:03.</p>
  <p>Good environment design helps us use the structural intuition we have formed and work better with the system. It helps us design for autonomy.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-37">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-37.jpg" alt="Desire paths" style="max-width: 100%">
  <div><a class="permalink" href="#slide-37">#</a>
  <p class="timestamp">18:03-18:48.</p>
  <p>I like to talk about desire paths as an analogy. An architect has made a certain path through a landscape with roads and footpaths. But people walking through the landscape create marks where they actually want to walk, because that route helps them navigate better. These are desire paths. Our goal as architects is to make sure AI agents have access to desire paths, rather than enforcing exactly how they should navigate our system.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-38">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-38.jpg" alt="WixQA customer support example" style="max-width: 100%">
  <div><a class="permalink" href="#slide-38">#</a>
  <p class="timestamp">18:48-19:15.</p>
  <p>Let us ground this with an example. I took a dataset called WixQA, for the Wix website builder. It is a customer support dataset full of questions and answers. There is an expected answer for each question, and there is a knowledge base. A support person can look up the knowledge base to give the answer. Let us try to automate this with AI.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-39">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-39.jpg" alt="Two architectures" style="max-width: 100%">
  <div><a class="permalink" href="#slide-39">#</a>
  <p class="timestamp">19:15-20:27.</p>
  <p>We have two architectures. Architecture A is a kind of architecture I have run into before. This version is a little cartoonish, but roughly in the ballpark. It is a pipeline where an LLM is applied at multiple steps: it takes the customer intent, routes it to a topic, queries a vector database after filtering on the topic, uses RAG to create a response, and maybe adds a quality-check step that asks it to retry if quality is bad. Architecture B is effectively a while loop. You tell the agent it has access to a search-knowledge-base tool. In this case I used BM25, but the details are not important. What matters is that you give the question directly to the agent, and the agent runs in a loop until it figures out what needs to be done.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-40">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-40.jpg" alt="Results for two architectures" style="max-width: 100%">
  <div><a class="permalink" href="#slide-40">#</a>
  <p class="timestamp">20:27-21:03.</p>
  <p>How were the results when I benchmarked these two architectures? Architecture B was much, much better. What was interesting is that on the left we have older-generation models that are smaller and weaker, and toward the right we have newer-generation models that are smarter and better in a lot of ways. The gap only increases with newer models. That suggests that something in Architecture A, where we specify all these steps, was making up for certain shortcomings in weaker models.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-41">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-41.jpg" alt="Architecture A and Architecture B labels" style="max-width: 100%">
  <div><a class="permalink" href="#slide-41">#</a>
  <p class="timestamp">21:03-21:21.</p>
  <p>So I will reveal what these two architectures are. Architecture A is artisanal architecture, where we as humans architect how the LLM should navigate the system. Architecture B is a bitter-lessoned architecture.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-42">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-42.jpg" alt="The Bitter Lesson" style="max-width: 100%">
  <div><a class="permalink" href="#slide-42">#</a>
  <p class="timestamp">21:21-22:03.</p>
  <p>Something that seems to be better in the long run is respecting the bitter lesson, proposed by Richard Sutton. Sutton was talking about developing AI models and AI systems, and the lesson is effectively: avoid encoding human knowledge into your method. Take the example of Go. Go engines that encoded exactly how humans played into the code did much worse than AlphaGo or AlphaZero, which used a meta-method that taught the system how to learn without encoding specific human moves. AlphaZero did much better.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-43">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-43.jpg" alt="Engineers have not digested the bitter lesson" style="max-width: 100%">
  <div><a class="permalink" href="#slide-43">#</a>
  <p class="timestamp">22:03-22:30.</p>
  <p>It turns out this helps even at the application layer. Over time, bitter-lesson architectures seem to work better, as I benchmarked here. They are also much simpler to build. We have less weaving, fewer integration points, and an easier time debugging and evaluating. Evaluation is already hard in a fuzzy world, so simple architectures help.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-44">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-44.jpg" alt="Summarising environment design" style="max-width: 100%">
  <div><a class="permalink" href="#slide-44">#</a>
  <p class="timestamp">22:30-22:48.</p>
  <p>To summarize the skill: we want to make these systems work in our favor, so we need to consciously design an environment that is agent-friendly and bitter-lesson-conscious.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-47">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-47.jpg" alt="Empirical rigor intro" style="max-width: 100%">
  <div><a class="permalink" href="#slide-47">#</a>
  <p class="timestamp">22:48-23:00.</p>
  <p>Our last skill is empirical rigor. Prasanna earlier in the day gave a great example of what that process looks like. Empirical rigor brings us closer to understanding systems through observed behavior.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-48">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-48.jpg" alt="Empirical rigor guards us from being led astray" style="max-width: 100%">
  <div><a class="permalink" href="#slide-48">#</a>
  <p class="timestamp">23:00-23:09.</p>
  <p>It prevents us from being fooled by our own creations, and by the systems we are working with.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-49">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-49.jpg" alt="Inductive inference matters more than ever" style="max-width: 100%">
  <div><a class="permalink" href="#slide-49">#</a>
  <p class="timestamp">23:09-23:39.</p>
  <p>What is interesting now is that inductive inference matters more than ever. We are used to taking a fact that implies a behavior: if an if-statement holds true, you go into the first branch and not the second. The structure gives us a clear pointer to what is going to happen. But now we have to deal with fuzziness. We have to iteratively observe, draw conclusions, and refine our understanding. That is inductive inference, and that is effectively what evaluation and benchmarking are.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-51">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-51.jpg" alt="Most software engineers do not have this mindset" style="max-width: 100%">
  <div><a class="permalink" href="#slide-51">#</a>
  <p class="timestamp">23:39-23:51.</p>
  <p>It turns out most of us do not have this mindset. We are not used to it. Prasanna said children are pretty great at causal inference, but in my observation engineers are not. I struggle with it too.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-52">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-52.jpg" alt="Which is the best coding model?" style="max-width: 100%">
  <div><a class="permalink" href="#slide-52">#</a>
  <p class="timestamp">23:51-24:06.</p>
  <p>So let us do an exercise. Which is the best coding model? I hear some “Opus.” Obviously we do not want to go by vibes, so let us look at some data.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-54">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-54.jpg" alt="SWE benchmark chart" style="max-width: 100%">
  <div><a class="permalink" href="#slide-54">#</a>
  <p class="timestamp">24:06-24:27.</p>
  <p>Let us look at the most popular SWE benchmark. Opus is the highest. But what is interesting is that Claude Opus 4.5 is highest, then Gemini 3 Flash. Any Gemini 3 Flash fans? Obviously not. Somewhere in fourth place is Opus 4.6, which is doing worse.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-55">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-55.jpg" alt="No error bars" style="max-width: 100%">
  <div><a class="permalink" href="#slide-55">#</a>
  <p class="timestamp">24:27-24:42.</p>
  <p>If this seems confusing, note that there are no error bars either. It is almost like this particular report is pretending stochasticity does not exist, as if you are going to get the same result on every run.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-56">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-56.jpg" alt="Look at benchmark details" style="max-width: 100%">
  <div><a class="permalink" href="#slide-56">#</a>
  <p class="timestamp">24:42-25:12.</p>
  <p>Why are the results not matching our intuition? Let us look at the data. In SWE-bench, we measure a model by checking whether the patch it generates passes the unit tests. It turns out many of these problems are from the Django repository, the benchmark is a Python dataset, and many issues touch only a few lines of code. That is not how we are doing agentic coding.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-57">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-57.jpg" alt="SWE plus passing unit tests" style="max-width: 100%">
  <div><a class="permalink" href="#slide-57">#</a>
  <p class="timestamp">25:12-25:21.</p>
  <p>So we cannot collapse SWE-bench into a single, one-dimensional metric.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-58">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-58.jpg" alt="Software engineers are susceptible to being fooled by data due to tribalism" style="max-width: 100%">
  <div><a class="permalink" href="#slide-58">#</a>
  <p class="timestamp">25:21-25:51.</p>
  <p>The reason we should not get fooled by data is that we are susceptible to being fooled because of rampant tribalism. We want to identify with certain methods and technologies, and we want the data to agree with that. We should avoid that.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-59">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-59.jpg" alt="Feynman quote" style="max-width: 100%">
  <div><a class="permalink" href="#slide-59">#</a>
  <p class="timestamp">25:51-26:00.</p>
  <p>I often agree with Feynman here: it is much more interesting to live not knowing than to have answers that might be wrong.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-60">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-60.jpg" alt="Look at the data" style="max-width: 100%">
  <div><a class="permalink" href="#slide-60">#</a>
  <p class="timestamp">26:00-26:15.</p>
  <p>The main thing to take away is: look at the data. Look at the benchmarks that give you these results. You do not need heavy data collection and manual audits to learn about your system. Often you can learn a lot and falsify wrong assumptions just by looking at the data.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-61">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-61.jpg" alt="Our minimum viable benchmark" style="max-width: 100%">
  <div><a class="permalink" href="#slide-61">#</a>
  <p class="timestamp">26:15-27:06.</p>
  <p>One example: when we were building a system that produced code, we wanted to do QA over the code. We got an LLM-as-judge to do the QA. As you can see in the image, Claude Sonnet 4.5 at the time was passing acceptance criteria while saying “though with an implementation bug.” That is not what passing means. When we switched to GPT-5, even with only about ten examples, we could clearly tell that GPT-5 was a much better choice of judge. When Opus dropped, because we had this system and a way of checking our data, we could also conclude where Opus had improved compared to Sonnet.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-62">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-62.jpg" alt="Low hanging fruit" style="max-width: 100%">
  <div><a class="permalink" href="#slide-62">#</a>
  <p class="timestamp">27:06-27:42.</p>
  <p>Looking at the data is important. Some low-hanging fruit for being more empirically rigorous: map the metrics you care about to actual business outcomes. Do not ask vague questions like “What is the best coding agent?” Ask “What is the best coding agent for your organization?” Keep small internal benchmarks, and let them grow over time. Correct the biases of your LLM judges. Look at the data. Report uncertainty. Do not pretend stochasticity does not exist.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-64">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-64.jpg" alt="Summarising empirical rigor" style="max-width: 100%">
  <div><a class="permalink" href="#slide-64">#</a>
  <p class="timestamp">27:42-27:51.</p>
  <p>That is our third skill. The summary is that you should not get fooled by your data, and one easy way to start is to look at it.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-66">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-66.jpg" alt="The three skills are not just for AI" style="max-width: 100%">
  <div><a class="permalink" href="#slide-66">#</a>
  <p class="timestamp">27:51-28:03.</p>
  <p>It turns out these three skills are not just for AI. They are useful tools for dealing with any kind of uncertainty and fuzz.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-67">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-67.jpg" alt="The AI revolution in software happens to fall into this" style="max-width: 100%">
  <div><a class="permalink" href="#slide-67">#</a>
  <p class="timestamp">28:03-28:18.</p>
  <p>We do live in very uncertain times, and the AI revolution in software plays into some of this.</p>
  </div>
</div>

<div class="annotated-talk-slide" id="slide-69">
  <img loading="lazy" src="/images/blog/building-systems-that-build-the-software/slide-69.jpg" alt="Fin" style="max-width: 100%">
  <div><a class="permalink" href="#slide-69">#</a>
  <p class="timestamp">28:18-28:54.</p>
  <p>I have found these three skills useful as life skills too, and I hope they are useful for you. Thank you.</p>
  </div>
</div>
