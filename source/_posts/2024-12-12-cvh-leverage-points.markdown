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
> <div style="margin-right: 10%; text-align: right">— <em>Donella H. Meadows</em></div>

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

What we desired is a system that controls BP at a population level and thus saves lives. But what we ended up with instead was a system that maximizes the number of patients that need to be screened!

Can you think of other problems with this system?

At Resolve To Save Lives, I've seen my team make many such interventions to programs around the world. The bulk of my work has been through the system enabled by our [offline first app, Simple](/blog/2020/01/02/offline-first-apps-are-appropriate-for-many-clini/).

Our interventions often map to what the Systems Thinker Donella Meadows describes as "Leverage Points" which are places to intervene in a system.

Here are the leverage points as stated by her, in increasing order of effectiveness. The more effective the lever, the harder it is to pull:

**12. Numbers: Constants and parameters such as subsidies, taxes, and standards**

These are like arranging deck chairs on the Titanic. Twiddling with these numbers in an existing system rarely changes its behaviour in significant ways. An example of this in Peculiaristan's program is increasing the rate of screening visiting patients.

**11. Buffers: The sizes of stabilizing stocks relative to their flows**

Bigger buffers and stocks can help us stabilize systems. Improving the capacity of hospitals to allow more patient appointments, as well as increasing the drug stock supply, are some ways to improve our system. Because a lot of these stocks are physical entities, I have found these pretty tricky to change as technologists.

**10. Stock-and-Flow Structures: Physical systems and their nodes of intersection**

An effective leverage point in our work is helping with the decentralization of care. Our digital systems are designed to encourage transfer of patients from large district hospitals to smaller clinics near their area, while still maintaining the same patient record. This greatly reduces the burden of patients as well as caregivers. 

**9. Delays: The lengths of time relative to the rates of system changes**

A huge motivator to introduce a well-designed digital information system in places that previously used paper records is the fact that it greatly reduces the delays and tightens feedback loops—the patient data is rapidly made available to the QI teams and programs can thus improve faster and more iteratively.

**8. Balancing Feedback Loops: The strength of the feedbacks relative to the impacts they are trying to correct**

A lot of our work goes into improving and strengthening the feedback loops that are present in our system. In the Simple app, we make it easy for health care workers to see all the overdue patients in their facility and make it a tap away to call them and get them back into care.

**6. Reinforcing Feedback Loops: The strength of the gain of driving loops**

Our constant focus on making the Simple app easy to use for healthcare workers has led to a pleasantly surprising reinforcing feedback loop. It turns out that a user-friendly app reduces the burden of training because peers can explain to each other how the app works, which is strengthened by the number of people who are experienced with using the app in a facility!

**7. Information Flows: The structure of who does and does not have access to information**

This is a leverage point that keeps on giving, and one that's easily within reach for technologists like us. We have been able to massively improve patient outcomes by improving how information flows. It's impossible to improve something that's hard to see or access!

* Health care workers have easy access to patient records and can easily see and call patients that are overdue.
* Health care workers can also see control rates and statistics for their own facility which helps them understand how they are collectively performing, and make local decisions.
* Facility managers can see drug stock levels and predict if they will be able to accept higher patient volumes. 
* Through the Simple dashboard and our Hearts360 indicators, QI teams have easy access to constantly updating aggregate data of key outcome indicators (control rates, missed visits, etc) which lets them quickly understand what's working and not working in their program and make improvements.

It's also important to note the information that we choose to not show. Adding a lot of complex and irrelevant data increases the burden on health care workers collecting the patient level data and makes the dashboard less useful due to a lot of noise and complexity. 

#### The last five leverage points

These are leverage points that are often the most effective, but the hardest to pull. My examples run sparse here, but we are aware that even a few interventions here would have a massive payoff.

**8. Rules: Incentives, punishments, constraints**



9. Self-Organization: The power to add, change, or evolve system structure 
10. Goals: The purpose of the system
11. Paradigms: The mind-set out of which the system—its goals, structure, rules, delays, parameters—arises
12. Transcending Paradigms
