---
title: "Saving Lives: A Systems Frame"
kind: article
author: Atharva Raykar
created_at: 2024-12-12 00:00:00 UTC
post_url: ""
layout: post
---
> “Hunger, poverty, environmental degradation, economic instability, unemployment, chronic disease, drug addiction, and war, for example, persist in spite of the analytical ability and technical brilliance that have been directed toward eradicating them. No one deliberately creates those problems, no one wants them to persist, but they persist nonetheless. That is because they are intrinsically systems problems—undesirable behaviors characteristic of the system structures that produce them. They will yield only as we reclaim our intuition, stop casting blame, see the system as the source of its own problems, and find the courage and wisdom to *restructure* it.”
>
> <div style="margin-right: 10%; text-align: right">— <em>Donella H. Meadows</em></div>

## The Story of Peculiaristan

Healthcare workers in Peculiaristan's district hospitals are randomly screening visiting patients for hypertension. If a patient has a high blood pressure, they are enrolled for a hypertension control program and sent off to a doctor.

![](/images/blog/screening.webp)

The doctor advises this patient to take a CCB medication like Amlodipine. They need to take this drug every day control their BP (every 20mm increase in systolic BP doubles their risk of death). To get their drugs, they need to come back to the hospital once every 28 days.

![](/images/blog/screening_and_appointment.webp)

This is part of a program that the non-communicable diseases (NCD) division of the Health Department of Peculiaristan has come up with. It's typical of a growing, developing country. It turns out that hypertension (ie, high BP) eventually kills more people than anything else in the world.

To reduce deaths due to heart disease, hypertensive patients need to keep their BP under control (<140/90 mm Hg)—this means regularly returning to care, and taking their medicines.

The hope is that by running this at scale, we are improving the health and well being of the general population.

![](/images/blog/health_improvement_flow.webp)

The health officials in the NCD division need to know how their program is performing.

The clinicians collect data from each patient visit into paper records. The quality improvement teams in the NCD division requests aggregate patient data from the hospitals (like number of patients screened in this program)—they add these up across districts to understand how this program is performing.

![](/images/blog/qi_introduced.webp)

They might then drive action to improve this figure—in Peculiaristan, they chose to sample patients at the hospital more aggressively to improve the screening flow.

![](/images/blog/improve_screening.webp)

Later that year, an independent annual survey on heart disease and BP control rates was conducted on the patient population served by the district hospitals. The results were grim.

Despite all this hard work on the ground, the annual report showed no improvement in mortality rates and the population's BP control rate—in fact, it was worse than the year before! What happened?

Public health is a notoriously hard problem to work on. Before I worked with Resolve To Save Lives, I had almost no clue about what it takes to make any kind of dent in this space. It turns out that it helps to think in systems.

As technologists, we have the skill sets and the tools to scale ideas and methods. This puts us in a position where we do not have to accept a bad thing that we see around us—we can fix it.

## The Systems Frame: Peculiaristan's stocks, buffers and information flows

Let's first strengthen the notion of what I mean by a system.

*System*: A set of elements or parts that is coherently organized and interconnected in a pattern or structure that produces a characteristic set of behaviors, often classified as its “function” or “purpose".

Our system in this case, is Peculiaristan's hypertension control program. Here's some adages on systems.

* A system is more than the sum of its parts.
* Many of the interconnections in systems operate through the flow of information.
* The least obvious part of the system, its function or purpose, is often the most crucial determinant of the system’s behavior.
* System structure is the source of system behavior. System behavior reveals itself as a series of events over time.

One way to think about systems is in terms of *stocks* and *flows*. Let's look at the patient screening subsystem again:

![](/images/blog/screening.webp)

The fat arrow is a *flow*. All systems involve interconnects through which information (or actual people) flows. These flows play an important role in defining a system's purpose (which may or may not match the system's stated purpose!).

Each box represents a *stock*—you can think of as the memory of the history of changing flows in this system. A stock may be a physical thing, like the number of registered patients, or the BP control rate. It could also be an abstract qualitative resource like an individual patient's motivation to improve their health.

The neat thing about stocks in a system is that they naturally decouple flows in a system by acting as a buffering mechanism. They allow the stocks to temporarily be out of balance with each other. Buffers offer some resilience to systems. (It would be impossible for hospitals had to send all their paper record data at the same rate patients are visiting for appointments!)

Can you identify the stocks in our program model below?

![](/images/blog/identify_stocks_ex.w)

<details style='background-color:#eee; padding:0.4rem 0.8rem 0.4rem 0.8rem; border-radius:3px'>
  <summary>Reveal Answers</summary>
  <ul>
    <li>Total population in a region</li>
    <li>Registered patients that need to return to care</li>
    <li>Motivation to improve health/Desire for free medication</li>
    <li>Patient appointments in public facilities</li>
    <li>Patient data received by the QI team</li>
    <li>Indicators and analyses (eg: added up patient screening counts)</li>
    <li>Actual BP control rate on ground (proxy for health outcomes)</li>
  </ul>
  <p>We could choose to include other stocks in our model, like drug stocks at hospitals, clinician's energy levels and more—we have kept it somewhat simple for the sake of demonstration.</p>
</details>

<br>

Readers might have noticed that thinner arrows represent actions or decisions that affect flow rates—we call these information links. The motivation to improve one's health and the desire for free medication are stocks that would affect the flow rate of patients going to their appointments. The more of it there is, the more would be the flow rate, and vice versa. This constitutes something called a _feedback loop_.

Almost every decision point comes with a feedback loop. An important feedback loop we have in our system is one enabled by aggregating patient data and using it to improve screening. If the number of patients registered are low, this will be caught and the implementation of aggressive screening will bring this stock back up. A thermostat is a classic example of a system with a _balancing feedback loop_.

Another important kind of feedback loop not represented in the system above is a reinforcing feedback loop. This is a loop that represents compounding or snowballing, like an interest-bearing bank account. We will come back to how we can use these to help us soon.

Stocks, buffers, information flows, and feedback loops are all things that we can influence that will help us understand and improve our systems. These are some of our leverage points.

## Re-examining the Peculiaristan program through the systems frame

Let's step back to what went wrong with our Peculiaristan's health program. To recap:
* Patients were screened and the hypertensive ones were identified.
* They were asked to come to the hospital every 28 days.
* The QI teams got a hold of the patient screening data—they wanted to drive up this number, and thus screened more aggressively. Millions of patients were screened!
* No improvement to mortality rates!

The reason for this systems surprise is that the wrong lever was pulled in the wrong direction. There was not enough effort to get patients to regularly return to care and take their medicines, nor was this data tracked. The "registered patients" stock was increasing, but "patient appointment count" stock was not. The motivation to improve one's health was not in enough supply to improve the flow. The hospitals had no mechanism to sort through their paper records and figure out which patients had missed their appointments!

There were other negative feedback loops—the district hospitals were quite far from the villages from which most patients were screened. The patients were unsure if there were enough drugs in stock at the facility—a shortage was not common.

At its core, the main issues with this system were:
* The data wasn't useful or sufficient! The QI team could only see and optimise an input metric like "patients registered", and not outcome metrics like "Percentage of patients with controlled BP", "Percentage of patients who missed their appointments"
* The right information was not quickly accessible to the right people—collecting paper records and adding them up slowed down the program team a lot. Not knowing which patients needed to come back to care also did not help the health care workers in the district hospital.

What we desire is a system that controls BP at a population level and thus saves lives. But what we ended up with was a system that maximizes the number of patients that need to be screened!

Can you think of other problems with this system?

## Leverage Points: Learnings from building digital tools in public health

I've seen my team make many such interventions to programs around the world. The bulk of my work has been through the system enabled by our [offline first app, Simple](/blog/2020/01/02/offline-first-apps-are-appropriate-for-many-clini/).

Our interventions often map to what prominent systems thinker Donella Meadows described as "Leverage Points"—these are places to intervene in a system. I love this articulation, because it gives us a clear way to see how to be an agent of change and engage with the systems around us.

Here are the leverage points as stated by her, in increasing order of effectiveness. The more effective the lever, the harder it is to usually pull:

**12. Numbers: Constants and parameters such as subsidies, taxes, and standards**

These are like arranging deck chairs on the Titanic. Twiddling with these numbers in an existing system rarely changes its behaviour in significant ways. An example of this in Peculiaristan's program is increasing the rate of screening visiting patients.

While these are occasionally useful, our team understands that it's more important to be directionally correct and not let perfect be the enemy of good when it comes to numbers.

**11. Buffers: The sizes of stabilizing stocks relative to their flows**

Bigger buffers and stocks can help us stabilize systems.

Improving the capacity of hospitals to allow more patient appointments and increasing the drug stock supply are some ways to improve our system. Because a lot of these stocks are physical entities, I have found these pretty tricky to change as technologists.

**10. Stock-and-Flow Structures: Physical systems and their nodes of intersection**

This would amount to rearranging where our fat arrows flow, and where the stocks are placed.

An effective leverage point in our work is helping with the [decentralization of care](https://resolvetosavelives.org/timeline/new-study-encourages-care-closer-to-home/). Our digital systems are designed to encourage transfer of patients from large district hospitals to smaller clinics near their area, while still maintaining the same patient record. This greatly reduces the burden of patients as well as caregivers.

**9. Delays: The lengths of time relative to the rates of system changes**

A huge motivator to introduce [a well-designed digital information system](https://www.simple.org/blog/user-centered-design-public-health/) in places that previously used paper records is the fact that it greatly reduces the delays and tightens feedback loops—the patient data is rapidly made available to the QI teams and programs can thus improve faster and more iteratively.

**8. Balancing Feedback Loops: The strength of the feedbacks relative to the impacts they are trying to correct**

A lot of our work goes into improving and strengthening the balancing feedback loops that are present in our system. One of the trickiest ones to maintain is the one that brings patients back to care.

In the Simple app, we make it easy for health care workers to see all the overdue patients in their facility—patients can be called from the line list with a single tap, which enables healthcare workers to get them back into care. Additionally, we also send SMS reminders for patients that are overdue. All these actions improve the patient flow to clinics—which in turn have improve the quality of data we receive. This enables better data-driven decisions to improve the program.

It's [a domino effect of good outcomes](https://www.simple.org/blog/revealing-data-behind-overdue-patient-calls/) that result in an improved BP control rate!

**7. Reinforcing Feedback Loops: The strength of the gain of driving loops**

It's also important to strengthen positive feedback loops.

Our constant focus on making the Simple app easy to use for healthcare workers has led to a pleasantly surprising reinforcing feedback loop. It turns out that a user-friendly app reduces the burden of training because peers can explain to each other how the app works, which is strengthened by the number of people who are experienced with using the app in a facility!

**6. Information Flows: The structure of who does and does not have access to information**

This is a leverage point that keeps on giving, and one that's technologists are great at enabling. We have been able to massively improve patient outcomes by improving how information flows, and making the right data visible to the right people. It's impossible to improve something that's hard to see or access!

* Health care workers have easy access to patient records in their district and can easily see and call patients that are overdue.
* Health care workers can also see control rates and statistics for their own facility which helps them understand how they are collectively performing, and make local decisions.
* Facility managers can see drug stock levels and predict if they will be able to accept higher patient volumes. 
* Through the Simple dashboard and our [HEARTS360 indicators](https://hearts360.org/), QI teams have easy access to constantly updating aggregate data of key outcome indicators (control rates, missed visits, etc) which lets them quickly understand what's working and not working in their program and make improvements.

It's also important to note the information that we choose to not show. Adding a lot of [complex and irrelevant data](/blog/2024/12/24/good-enough-data/) increases the [burden on health care workers](https://www.simple.org/blog/user-centered-design-public-health/) collecting the patient level data and makes the dashboard less useful due to a lot of noise and complexity.

#### The last five leverage points

These are leverage points that are often the most effective, but the hardest to pull. My examples run sparse here, but we are aware that even a few interventions in these points would have a massive payoff.

**5. Rules: Incentives, punishments, constraints**

Driving change cannot happen in a vacuum. In our case, this means partnering with stakeholders that can push the right incentives and understand what it takes to improve programs and, therefore improve the well being of their citizens.

Rules can govern how data is captured, used, and monitored within the program, effectively decided what can and cannot be built.

Rules can enforce usage of treatment protocols that simplifies patient care, like the one from WHO's [HEARTS](https://www.simple.org/blog/hearts360-dashboard/) technical package—the effect of these flow into other areas, like improving drug stock management.

Rules can help create SOPs enabling decentralisation of care, define roles and processes that ensure the smooth flow of stocks and reinforcement of positive feedback loops. All our technological interventions can only succeed if they are enforced at a program level.

Rules can also help decide how all the actors in our systems are empowered to provide care.

**4. Self-Organization: The power to add, change, or evolve system structure**

Meadows describes this well;

> ﻿“The most stunning thing living systems and some social systems can do is to change themselves utterly by creating whole new structures and behaviors. In biological systems that power is called evolution. In human economies it’s called technical advance or social revolution. In systems lingo it’s called self-organization.”

A massive learning for me while working as a technologist in public healthcare is that to truly make a lasting change, we have to work towards a purpose that is bigger than ourselves and beyond the organisation we're a part of.

The most important change that we have worked on over the years is not the well-crafted code we have written over the years, the technical systems or even the user experience and designs. It's a lot more than that—it's compiling, publishing and sharing all our hard-earned lessons and patterns that we have learned through all these years of engaging with this vastly complex public healthcare machinery across countries and partners.

It's critically important to enable other partners and governments to build and grow their versions of a "Simple system" that cater to their needs, and find a way to evolve beyond our own interventions.

We don't want to be the system and engulf everything. We want to instead create an ecosystem that gives rise to other wonderful systems that improve lives, ones that sustain long beyond our individual and organisational lifetimes.

**3. Goals: The purpose of the system**

What's more important than self-organisation are goals.

The true goal of a system contorts every leverage point below this one, be it physical stocks and flows, feedback loops, information flows—even self-organizing behavior.

If the ultimate goal of our system and everyone who has agency over it is to maximally save lives, it means that every intervention we make will be to keep that in mind.

All the work done by the team at Resolve To Save Lives grew out of this goal.

**2. Paradigms: The mind-set out of which the system—its goals, structure, rules, delays, parameters—arises**

Paradigms are the shared ideas in the minds of society—the great big unstated assumptions, or deepest set of beliefs about how the world works. These beliefs are unstated because it is unnecessary to state them—everyone already knows them. Shifting paradigms cause massive changes.

Here are some random examples of paradigms that underpin everything I and the team at RTSL have done:
* User-centered technology and information systems must be designed to empower healthcare workers on the ground.
* We must engage with public healthcare and help improve human well-being.
* The shoggoth of human mortality, cardiovascular disease, can be eliminated.
* Systemic thinking helps us make sense of hard problems.

#### 1. The final leverage point: Transcending Paradigms﻿

I can only speak for myself here. This leverage point is one that strikes deeply to me at a personal level—it's the recognition that existence of paradigms is itself a paradigm, and beyond that lies a void.

The truth is that there's no certainty in any worldview. The world we inhabit is beyond comprehension. Meaning is something we arbitrarily assign to our felt sense of reality.

> “If no paradigm is right, you can choose whatever one will help to achieve your purpose. If you have no idea where to get a purpose, you can listen to the universe. ”  
> [...]  
> “It is in this space of mastery over paradigms that people throw off addictions, live in constant joy, bring down empires, get locked up or burned at the stake or crucified or shot, and have impacts that last for millennia.”

I often don't know where my purpose comes from, _really why_ and from _what place_ I've chosen to do the things that I do. But what the universe has told me is that it's important to expand my boundary of caring—may it someday engulf the world.
