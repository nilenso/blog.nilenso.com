---
title: how to systematically save a good chunk of lives; a technologist's guide
kind: article
author: Atharva Raykar
created_at: 2024-12-12 00:00:00 UTC
post_url: cvh-systems-thinking
layout: post
---
> “Hunger, poverty, environmental degradation, economic instability, unemployment, chronic disease, drug addiction, and war, for example, persist in spite of the analytical ability and technical brilliance that have been directed toward eradicating them. No one deliberately creates those problems, no one wants them to persist, but they persist nonetheless. That is because they are intrinsically systems problems—undesirable behaviors characteristic of the system structures that produce them. They will yield only as we reclaim our intuition, stop casting blame, see the system as the source of its own problems, and find the courage and wisdom to *restructure* it.”
>
> — *Donella H. Meadows*

A public healthcare system can be so fractally complex that one could argue that it would be futile for me to even begin to describe it. Anyway here goes.

Peculiaristan's district hospitals are randomly screening visiting patients for hypertension. If a patient is found to have a high BP, they are registered for a hypertension control program. A doctor advises this patient to take a CCB medication like Amlodipine. They need to be taking these everyday to keep their BP under control (every 20mm increase in systolic BP doubles their risk of death). To get their drugs, they need to show up to the hospital once every 28 days.

This is part of a program that the non-communicable diseases (NCD) division of the Health Department of Peculiaristan has come up with, typical of a growing, developing country. It turns out that hypertension eventually kills more people than anything else in the world.

The patient's BPs are collected at every appointment, and this data is collected in paper records. Some hospitals have started using a digital system. The quality improvement teams in the NCD division requests for aggregate patient data (like number of patients screened in this program)—they add these up across districts to understand how this program is performing. They might then drive action to improve this figure—for example, they sample patients at the hospital more aggressively to improve the screening flow.

![](/images/blog/sydiag1.png)

Despite all this hard work on the ground, the annual report showed no improvement in mortality rates and the population's BP control rate—in fact, it was worse than the year before! What happened?

Public health is a notoriously hard problem to work on. Before I worked with Resolve To Save Lives, I had almost no clue about what I could do to make any kind of dent in this space. It turns out that it helps to think in systems.

My stint in public health taught me that it is approachable for a technologist to massively improve the world—and that adopting a systems thinking lens can help a lot.

We have the skill sets and the tools to scale ideas and methods. This puts us in a position where we do not have to accept a bad thing that we see around us—we can fix it.

Let's first strengthen the notion of what I mean by a system.

*System*: A set of elements or parts that is coherently organized and interconnected in a pattern or structure that produces a characteristic set of behaviors, often classified as its “function” or “purpose".

Our system in this case, is Peculiaristan's hypertension control program. Here's some adages on systems.

* A system is more than the sum of its parts.
* Many of the interconnections in systems operate through the flow of information.
* The least obvious part of the system, its function or purpose, is often the most crucial determinant of the system’s behavior.
* System structure is the source of system behavior. System behavior reveals itself as a series of events over time.

I've taken a peculiar decision to label the fat arrows as "flows". This is because all systems involve interconnects through which information (or actual people) flows. These flows play an important role in defining a system's purpose (which may or may not match the system's _stated_ purpose!).

The thinner arrows represent information links—these are actions that affect the flow.

We also have a bunch _stocks_ (represented by the boxes and circles), which you can think of as the memory of the history of changing flows in this system. A stock may be a physical thing, like the number of registered patients, or an abstract qualitative resource like the motivation to improve one's health.

This is a great start, and it has taken Peculiaristan a massive effort to get here!

It can get overwhelming to untangle this. But I've found Donella Meadow's leverage points as a useful framework to navigate this.

Here are the leverage points as stated by her, in decreasing order of effectiveness:

1. Numbers: Constants and parameters such as subsidies, taxes, and standards
2. Buffers: The sizes of stabilizing stocks relative to their flows
3. Stock-and-Flow Structures: Physical systems and their nodes of intersection
4. Delays: The lengths of time relative to the rates of system changes
8. Balancing Feedback Loops: The strength of the feedbacks relative to the impacts they are trying to correct
7. Reinforcing Feedback Loops: The strength of the gain of driving loops
6. Information Flows: The structure of who does and does not have access to information
5. Rules: Incentives, punishments, constraints
4. Self-Organization: The power to add, change, or evolve system structure 
3. Goals: The purpose of the system
2. Paradigms: The mind-set out of which the system—its goals, structure, rules, delays, parameters—arises
1. Transcending Paradigms

