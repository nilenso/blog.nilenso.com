---
title: "How to work with product: Towards what port do you sail?"
kind: article
author: Srihari Sriraman
created_at: 2025-11-21 00:00:00 UTC
post_url: how-to-work-with-product-towards-what-port
layout: post
---
> If one does not know to which port one is sailing, no wind is favorable. 
> …but when he knows, he must steer and watch the stars.\
>
> *Letter 71, Moral Letters to Lucilius, Seneca*

This might seem quite obvious, cliche even, but it’s quite difficult to apply to life. Or to building products. Making big decisions is hard. But then:

> Hard choices easy life, easy choices hard life.\
>
> *Jerzy Gregorek*

With building products in teams, the “hard life” part applies to the whole team. When leadership (engineering and product) fails to choose the port clearly, the entire team is stuck treading waters. And unfortunately this happens way too often. 

> Management is doing things right; leadership is doing the right things.”\
>
> *Stephen Covey*

Still, most leaders from what I know are familiar with this challenge, and take it up. However, many times, it’s more subtle, and usually of the form: *“There are 2 objectives, both are equally important”*.

> We must realize, and act on the realization, that if we try to focus on everything, we focus on nothing.\
>
> *John E. Doerr, Measure What Matters*

From the following excerpts of my experiences, I’ll try to illustrate how these kinds of issues show up in every day work.

![towards-what-port](/images/blog/gemini-generated-image.png)

### Knowing when you’re treading waters

- - -

At [Simple.org](http://simple.org/), one of the recurring debates in the early years was whether we should support patient screening. Screening meant that nurses would travel to villages and towns and check entire communities for cardiovascular issues. While our work was focused on hypertension, once the nurses were already in the field it felt incomplete to ignore diabetes. Screening promised a better understanding of population health, while our existing product was designed around longitudinal care of patients. At the time, this seemed like a high-level product call that engineering could stay out of, because we figured that core features such as patient search and follow up scheduling were needed no matter what… but the ambiguity kept creeping in anyway. Patient search behaved predictably inside a clinic because it showed patients registered to that facility, but in the field during screening, we had no shared understanding of what a search should return. Even entering a blood pressure created confusion because the clinic workflow called for follow up reminders while screening did not. These questions came up repeatedly, and each one caused a hiccup or delay in progress. And they added up.

- - -

A similar scenario unfolded when I worked on building *order-pooling* at Gojek, and it’s perhaps easier to see in two/three sided markets. *Pooling* is where one driver picks up multiple orders from the same restaurant and delivers them to customers who live near one another. Seems like a useful feature, but useful for whom? If the priority was higher utilisation for drivers, then we needed to focus on improving their income and increasing the number of orders they could complete each hour. Customer experience mattered, but only up to the point where it did not slow drivers down. If the priority was increased customer demand, questions of price, the ability to opt out, and the impact on wait times became far more important. We assumed we could make progress without choosing, because on the surface the feature looked generic enough to support both paths. But as we made decisions about pricing rules, batching behaviour, driver assignments, and customer communication, the lack of clarity surfaced again and again. Many small decisions depended on a choice we had not made, and a project that looked like 3 months of straightforward work grew into 4.

- - -

I once joined a team as a fixer, because the CTO felt that nothing meaningful had been delivered for almost a year. On my first day, I asked about the team’s objectives, and I got some hand-wavy and vague answers. The director of engineering said the PMs had never given them dashboards or metrics to work with. The PM, sitting in the same room, said they had plenty of dashboards but the engineers showed no interest in them. Product kept reporting metrics upward, and those metrics were flat. Engineering kept reporting completed initiatives, and there were plenty of them, but no one realised why the work was not improving the outcomes that mattered. The team also held several engineering-only meetings every week, intentionally excluding PMs because their presence was considered unnecessary for technical discussions. All I did was highlight this rift to leadership. And the biggest shift in morale came in a single meeting when leadership finally presented one clear north star metric. Half the ongoing initiatives were dropped on the spot because they obviously did not support that goal. We also removed the long list of engineering-only meetings and replaced them with two focused weekly sessions that included product, engineering, design, and QA together. Once everyone saw the same goal and talked in the same room, the team began to move forward again.

- - -

### Tugging on the mainsheet

Asking junior developers, or associate PMs simple questions about their work can reveal how clear the goals are, and how aligned everyone in the team is.

* *“Why are you working on feature X?”.* Ideally, they would open up their task / unit-of-work description, point to the observability section, and navigate to the corresponding leading and lagging metrics on a live dashboard that everyone in the team uses. Quite often though, the answers are *“because the PM told me to”*, *“It’s the most important feature right now”, “people are complaining about this”*, etc. Which are not *wrong* reasons per se, but not nearly as specific as we need to be.
* *“What was the impact of the last initiative you delivered?”*. This gets fewer good answers in my experience, despite it being one of the most important and documented aspects of satisfaction with one’s work.
* *“Is there something more important you should be working on?*”. If the work in the team is transparently prioritised as per the objectives, you would get a straightforward answer reflecting that. And in my experience, this often gets murky answers like *“Maybe feature Y is more important, but we stopped that work for some reason”,* or *“They say Z is more important, but X is what we need right now, and I’m not sure why”.*

Ideally, every single initiative should move the metric, and we respond by reinforcing efforts, or correcting course. In order to do that, every slice of work should incorporate building observability for it. And to do that, the product requirements should be clear about what metrics are expected to move, and why. It is engineering’s responsibility to seek that clarity.

- - -

### Without involvement,  there is no commitment

> “Without involvement, there is no commitment. Mark it down, asterisk it, circle it, underline it. No involvement, no commitment.”
>
> *Habit 2, Begin with the End in Mind, Stephen Covey*

This quote from Covey bears repeating in teams where product and engineering don’t work together. Without involvement from engineering in setting the goals, and understanding the metrics, there is no commitment to create the required observability, and the feedback loops necessary to work towards them.

In my experience, engineering is seldom involved in creating OKRs, and it’s usually product and business teams. This is antithetical to forging a deep relationship between the functions. As an engineer, try to find your way into those objective setting meetings. The team will thank you for being in it, even if they didn’t invite you to begin with.

### What should I do as an engineer?

1. Demand clarity on goals, ideally in terms of metrics that you can track. Participate in the conversations needed to achieve that clarity.
2. Make product-observability a first class requirement with every [unit of work](https://blog.nilenso.com/blog/2025/09/17/the-common-sense-unit-of-work/).
3. Establish balancing and reinforcing feedback loops in day to day work that ties back to those metrics.

![portless-boat](/images/blog/product-tea-table-image-1-.png)
