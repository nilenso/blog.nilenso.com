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
> <div style="margin-right: 10%; text-align: right">— *Donella H. Meadows*</div>

Peculiaristan's district hospitals are randomly screening visiting patients for hypertension. If a patient is found to have a high BP, they are registered for a hypertension control program.

![](/images/blog/screening.png)

A doctor advises this patient to take a CCB medication like Amlodipine. They need to be taking these everyday to keep their BP under control (every 20mm increase in systolic BP doubles their risk of death). To get their drugs, they need to show up to the hospital once every 28 days.

![](/images/blog/screening_and_appointment.png)

This is part of a program that the non-communicable diseases (NCD) division of the Health Department of Peculiaristan has come up with, typical of a growing, developing country. It turns out that hypertension eventually kills more people than anything else in the world. And this is entirely preventable, if patients are regularly returning to care, and taking their medicines!

The hope is that by running this at scale, we are improving the health and well being of the general population.

![](/images/blog/health_improvement_flow.png)

The health officials in the NCD division need to know how their program is performing.

The appointment data is collected in paper records. Some hospitals have started using a digital system. The quality improvement teams in the NCD division requests for aggregate patient data (like number of patients screened in this program)—they add these up across districts to understand how this program is performing.

![](/images/blog/qi_introduced.png)

They might then drive action to improve this figure—for example, they sample patients at the hospital more aggressively to improve the screening flow.

![](/images/blog/improve_screening.png)

Despite all this hard work on the ground, the annual report showed no improvement in mortality rates and the population's BP control rate—in fact, it was worse than the year before! What happened?

Public health is a notoriously hard problem to work on. Before I worked with Resolve To Save Lives, I had almost no clue about what it takes to make any kind of dent in this space. It turns out that it helps to think in systems.

As technologists, we have the skill sets and the tools to scale ideas and methods. This puts us in a position where we do not have to accept a bad thing that we see around us—we can fix it.

Let's first strengthen the notion of what I mean by a system.

*System*: A set of elements or parts that is coherently organized and interconnected in a pattern or structure that produces a characteristic set of behaviors, often classified as its “function” or “purpose".

Our system in this case, is Peculiaristan's hypertension control program. Here's some adages on systems.

* A system is more than the sum of its parts.
* Many of the interconnections in systems operate through the flow of information.
* The least obvious part of the system, its function or purpose, is often the most crucial determinant of the system’s behavior.
* System structure is the source of system behavior. System behavior reveals itself as a series of events over time.

One way to think about systems is in terms of *stocks* and *flows*. Let's look at the patient screening subsystem again:

![](/images/blog/screening.png)

The fat arrow is a *flow*. All systems involve interconnects through which information (or actual people) flows. These flows play an important role in defining a system's purpose (which may or may not match the system's stated purpose!).

Each box represents a *stock*—you can think of as the memory of the history of changing flows in this system. A stock may be a physical thing, like the number of registered patients, or the BP control rate. It could also be an abstract qualitative resource like an individual patient's motivation to improve their health.

The neat thing about stocks in a system is that they naturally decouple flows in a system by acting as a buffering mechanism. They allow the stocks to temporarily be out of balance with each other. Buffers offer some resilience to systems. (It would be impossible for hospitals had to send all their paper record data at the same rate patients are visiting for appointments!)

Can you identify the stocks in our program model below?

![](/images/blog/identify_stocks_ex.png)

Readers might also have noticed the thinner arrows that represent information links—these are actions that affect the flow rates. The motivation to improve one's health and the desire for free medication are stocks that would affect the flow rate of patients going for their appointments. The more of it there is, the more would be the flow rate, and vice versa. This constitutes something called a _feedback loop_.

Almost every decision point comes with a feedback loop. An important feedback loop we have in our system is the one enabled by aggregating patient data and using it to improve screening. If the number of patients registered are low, this will be caught and the implementation of aggressive screening will bring this stock back up. A thermostat is a classic example of a system with a balancing feedback loop.

Another important kind of feedback loop that is not represented in the system above is a reinforcing feedback loop. This is a loop that represents compounding or snowballing—like an interest-bearing bank account. We will come back to how we can use these to help us soon.  <later: peer training example>

Stocks, buffers, information flows, and feedback loops are all things that we can influence that will help us understand and improve our systems. These are some of our leverage points.

Let's step back to what went wrong with our Peculiaristan's health program. To recap:
* Patients were screened and the hypertensive ones were identified.
* They were asked to come to the hospital every 28 days.
* The QI teams got a hold of the patient screening data—they wanted to drive up this number, and thus screened more aggressively. Millions of patients were screened!
* No improvement to mortality rates!

The reason for the system's surprise is that the wrong lever was pulled in the wrong direction. The information the QI team lacked is that not enough efforts were made to actually get the patients to regularly come to their appointments and take medicines—the "registered patients" stock was increasing, but "patient appointment count" stock was not. The motivation to improve one's health was not in enough supply to improve the flow. The hospitals had no mechanism to sort through their paper records and figure out which patients had missed their appointments!

Moreover there were other negative feedback loops—the district hospitals were quite far from the villages from which most patients were screened. The patients were unsure if there were enough drugs in stock at the facility—a shortage was not common.

Fundamentally, the main issues with this system were:
* The QI team could only see and optimise an input metric like "patients registered", and not outcome metrics like "Percentage of patients with controlled BP", "Percentage of patients who missed their appointments", etc
* The right information was not accessible to the right people in a reasonable amount of time—Collecting paper records and adding them up slowed down the program team a lot. Not knowing which patients needed to come back to care also did not help the health care workers in the district hospital.

Can you think of other problems with this system?



Here are the leverage points as stated by her, in increasing order of effectiveness:

1. Numbers: Constants and parameters such as subsidies, taxes, and standards
2. Buffers: The sizes of stabilizing stocks relative to their flows
3. Stock-and-Flow Structures: Physical systems and their nodes of intersection
4. Delays: The lengths of time relative to the rates of system changes
5. Balancing Feedback Loops: The strength of the feedbacks relative to the impacts they are trying to correct
6. Reinforcing Feedback Loops: The strength of the gain of driving loops
7. Information Flows: The structure of who does and does not have access to information
8. Rules: Incentives, punishments, constraints
9. Self-Organization: The power to add, change, or evolve system structure 
10. Goals: The purpose of the system
11. Paradigms: The mind-set out of which the system—its goals, structure, rules, delays, parameters—arises
12. Transcending Paradigms
