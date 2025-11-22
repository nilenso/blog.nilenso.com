---
title: "How to work with product: To what port do you sail?"
kind: article
author: Srihari Sriraman
created_at: 2025-11-21 00:00:00 UTC
post_url: how-to-work-with-product-to-what-port
layout: post
---
> If one does not know to which port one is sailing, no wind is favorable.
>
> *[Letter 71, Moral Letters to Lucilius, Seneca](https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_71)*

This might seem quite obvious, cliché even, but it’s surprisingly difficult to apply to life, or to building products. Making big decisions is hard. But then:

> Hard choices easy life, easy choices hard life.
>
> *Jerzy Gregorek*

When leadership fails to make the hard choices, the entire team ends up stuck, treading water. Most leaders I know recognise this and try to make those calls. But the day-to-day challenges inside teams are more subtle, and often look like this: *"There are two objectives; both are equally important."*

If we try to focus on everything, we focus on nothing, as John Doerr puts it in [Measure What Matters](https://www.whatmatters.com/). In the following excerpts from my experience, I’ll illustrate how these issues show up in everyday work.

![towards-what-port](/images/blog/gemini-generated-image.png)

### Know when you’re treading water

- - -

At [Simple.org](http://simple.org/), one of the recurring debates in the early years was whether we should support patient screening. Screening meant that nurses would travel to villages and towns and check entire communities for cardiovascular issues. While our work was focused on hypertension, once the nurses were already in the field, it felt incomplete to ignore diabetes. Screening promised a better understanding of population health, while our existing product was designed around longitudinal care of patients. At the time, this seemed like a high-level product call that engineering could stay out of, because we figured that core features such as patient search and follow up scheduling were needed no matter what… but the ambiguity kept creeping in. Patient search behaved predictably inside a clinic because it showed patients registered to that facility, but in the field during screening, we had no shared understanding of what results a search should return. Even entering a blood pressure reading created confusion because the clinic workflow called for follow up reminders while screening did not. These questions came up repeatedly, each causing a hiccup or delay in progress. And they added up.

- - -

A similar scenario unfolded when I worked on building *order-pooling* at Gojek, and it’s perhaps easier to see in two/three sided markets. *Pooling* is where one driver picks up multiple orders from the same restaurant and delivers them to customers who live near one another. Seems like a useful feature, but useful for whom? If the priority was higher utilisation for drivers, then we needed to focus on improving their income and increasing the number of orders they could complete each hour. Customer experience mattered, but only up to the point where it did not slow drivers down. If the priority was increased customer demand, questions of pricing, ability to opt-out of pooling, and the impact on wait times became far more important. We assumed we could make progress without choosing, because, on the surface, the feature looked generic enough to support both paths. But as we made decisions about pricing rules, batching behaviour, driver assignments, and customer communication, the lack of clarity surfaced again and again. Many small decisions depended on a choice we had not made, and a project that looked like three months of straightforward work grew into four.

- - -

I once joined a team as a fixer, because the CTO believed that nothing meaningful had been delivered for almost a year. On my first day, I asked about the team’s objectives, and I received  vague, hand-wavy answers. The director of engineering said the PMs had never given them dashboards or metrics to work with. The PM, sitting in the same room, said they had plenty of dashboards but the engineers showed no interest in them. Product kept reporting metrics to leadership, and those metrics were flat. Engineering kept reporting completed initiatives, and there were plenty of them, but no one realised why the work was not improving the outcomes that mattered. The team also held several engineering-only meetings every week, intentionally excluding PMs because their presence was considered unnecessary for technical discussions. All I did was highlight this rift to leadership. And the biggest shift in morale came in a single meeting when leadership finally presented one clear north star metric. Half the ongoing initiatives were dropped on the spot because they did not support that goal. We also removed the long list of engineering-only meetings and replaced them with two focused weekly sessions that included product, engineering, design, and QA together. Once everyone saw the same goal and talked in the same room, the team began to move forward again.

- - -

### Tugging on the mainsheet

Asking junior developers, or associate PMs simple questions about their work can reveal how clear the goals are, and how aligned everyone in the team is.

* *“Why are you working on feature X?”.* Ideally, they would open up their task / unit-of-work description, point to the observability section, and navigate to the corresponding leading and lagging metrics on a live dashboard that everyone in the team uses. Quite often though, the answers are *“because the PM told me to”*, *“It’s the most important feature right now”, “people are complaining about this”*, etc. Which are not *wrong* reasons per se, but not nearly as specific as we need to be.
* *“What was the impact of the last initiative you delivered?”*. This gets fewer good answers in my experience, despite it being one of the most important and documented aspects of satisfaction with one’s work.
* *“Is there something more important you should be working on?*”. If the work in the team is transparently prioritised as per the objectives, you would get a straightforward answer reflecting that. And in my experience, this often gets murky answers like *“Maybe feature Y is more important, but we stopped that work for some reason”,* or *“They say Z is more important, but X is what we need right now, and I’m not sure why”.*

Ideally, every single initiative should move the metric, and we respond by reinforcing efforts, or correcting course. In order to do that, every slice of work should incorporate building observability for it. And to do that, the product requirements should be clear about what metrics are expected to move, and why. It is engineering’s responsibility to seek that clarity out.

- - -

### Without involvement, there is no commitment

> “Without involvement, there is no commitment. Mark it down, asterisk it, circle it, underline it. No involvement, no commitment.”
>
> *Habit 2, Begin with the End in Mind, Stephen Covey*

This quote bears repeating in teams where product and engineering fail to work together. Without involvement from engineering in setting the goals, and understanding the metrics, there is no commitment to create the required observability, and the feedback loops necessary to work toward them.

In my experience, engineering is seldom involved in creating OKRs, and it’s usually owned by product and business teams. This is antithetical to forging a deep relationship between the functions. If you're a leader, use your influence to bring engineering to the table. If you don't have the influence yet, build it by creating value around the objectives anyway. Understand them, challenge them, and help make them real. Comment on the OKR docs with your views, push to refine that metric you think is poorly defined, or negotiate on that goal you think is too steep. It's hard, but you have to work your way up to the table.

### What should I do as an engineer?

Work with product to get clarity on the port. Once you have it, as Seneca suggests, you must steer and watch the stars. It boils down to three simple things:

1. Demand clarity on goals, ideally in terms of metrics you can track, and participate in the conversations needed to achieve that clarity.
2. Make product observability a first-class requirement with every [unit of work](https://blog.nilenso.com/blog/2025/09/17/the-common-sense-unit-of-work/).
3. Establish balancing and reinforcing feedback loops in day-to-day work that tie back to those metrics.

![portless-boat](/images/blog/product-tea-table-image-1-.png)
