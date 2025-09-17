---
title: The common sense unit of work
kind: article
author: Srihari Sriraman
created_at: 2025-09-17 00:00:00 UTC
layout: post
---
The real world of software development processes is a vast and fragmented landscape of practices depending on culture, scale and goals. But the essence of all those practices are a few familiar and simple activities, revolving around a unit of work that’s valuable to the business.

If a typical software development lifecycle were to be modelled in software, the unit of work would be the central abstraction. We would have state machines or workflows around it, carrying it from specification to deployment, customisable to each team’s processes. But their effectiveness depends on how good this abstraction is, and how well it enables the activities around it.

Such activities on the unit of work are performed by various team members like product managers, engineers, designers, etc through its life. So, it’s important for the same abstraction to work well for all its users.

Here’s a walkthrough of those familiar real-world activities, so we can learn about the properties of a unit of work.

## Breaking it down

We typically start with product or feature requirements. We don’t usually take on a full feature in one shot, it’s “too big”. Especially if it’s complex enough to need some technical design and specification written along with it. We break it down into **small** parts that are more approachable for solving, and also give us a steady sense of progress.

Now the product requirement is actually a *hypothesis* for creating business value, and we need to validate the hypothesis as early as possible. So, the small parts need to be **valuable** to the customer.

In other words, we need the unit of work to be a slice of the cake, not a layer.

![slice-of-cake](/images/blog/breaking-it-down.webp)

Of course, bug fixes and refactors aren’t providing value in the same way, and that’s okay. Sometimes there are technical tasks that are best left independent. That’s okay too. No need to be dogmatic as long as the broad needs of value, and sense of progress are being met.

## Planning

Before starting work, we want to **prioritise**, because it saves a lot of time. We want to ship the most valuable slices first, and perhaps discard some low priority slices. But we can’t prioritise without weighing the business value against the implementation effort.

All slices aren’t the same size, so we **estimate** the implementation effort first. Some large slices can have low product value, so we would want to break them into even smaller slices to prioritise parts we care about most. Some smaller slices can’t be engineered independently, so we build the larger slice anyway. The unit needs to be **negotiable**.

![planning-with-slices](/images/blog/planning-cake-cut.webp)

And since we’re doing this as a team, we’ll want to ensure that the slices are as **independent** as possible, so that we can each do our part without waiting, and we don’t step on each other’s toes.

## Gathering context

A unit can be specified today, picked up for execution next month, blocked by another task, and then deprioritised into the backlog. Over its life, it gathers context about various things:

* What value it provides, how to verify it
* How it needs to be implemented
* Missing pieces of context that came together after conversations
* Unknowns that were resolved or unresolved
* Who worked on it, what issues they ran into
* What bugs came up in testing, and QA before release

![gathering-context](/images/blog/gathering-context.png)

Keeping these pieces of **context collected in a single place** helps in picking it up from where it was left off. When discussing, implementing, or tracking, it’s useful to have the same artifact in front of us.

## Solving

Knowing exactly what we’re solving for is very helpful, so we can build *just enough software™️*. No more, no less. So we need to define the **acceptance criteria** that we can all agree on.

Then, solve until we meet them. 

It’s good to **automate checking** whether the meet the acceptance criteria, because we’re going to be doing that an awful lot when solving.

## Verifying

Confidence usually doesn’t require checking every possible case, only the key ones that capture most of the impact. Yes, we checked this slice every step of the way, but it is useful to inspect it one last time before serving.

When is a unit considered **done**? When the slice has been served. When it’s in the hands of the user, in production, potentially behind a feature flag.

![verifying](/images/blog/verifying.webp)

And that’s it. To manage the life cycle of software development, we manage the unit of work. Some would say we need to [INVEST](https://xp123.com/invest-in-good-stories-and-smart-tasks/) in good units of work. And some of you might rightly recognise this unit sort of looks like a [User Story](https://c2.com/xp/UserStory.html).

- - -

## Does your unit of work need refactoring?

We’re fairly aware of the penalties of leaky abstractions in software. The incidental complexity of getting our primary real world abstractions wrong, grows exponentially with each layer of software built over it, until the whole system is slow sludgy slop that’s difficult to work with. We can hack it here and there, and celebrate minor wins, but the big wins were lost in the ignored opportunities to refactor that central abstraction.

If we apply the same thought process to software development, we’ll see that our core abstraction, the unit of work, might need refactoring.

Big gains in developer productivity in this economic weather are important. Prioritising by value, eliminating unnecessary work, and validating quickly, are some holistic ways to be more productive. And they require a good unit of work.

*Even your favourite AI assistant needs a well defined unit of work.*

Hence, this article rehashing a two-decade old pitch for some common sense agile.

## Annexes and apologies

* Yes, I’m aware the classic definition of user stories doesn’t have implementation details.
* Slicing can happen across n-dimensions, and breaking down a hard problem effectively, can actually be a very hard problem.
* If you want to read the OG Agile material, you can read:

  * Kent Beck introducing story cards in [XPX](https://www.goodreads.com/book/show/67833.Extreme_Programming_Explained) (Chapter 15 on planning)
  * Bill Wake’s [writing](https://xp123.com/user-stories/), and the INVEST criteria are condensed, quick reads
  * The [C2 page](https://c2.com/xp/UserStory.html) on User Stories for opinions and some discussions
  * Ron Jefferies on [Card, Conversation and Confirmation](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/).
  * Mike Cohn’s [User Stories Applied](https://www.goodreads.com/book/show/3856.User_Stories_Applied) is a deep dive.
* I like [Gergely Orosz and Kent Beck’s response to McKinsey](https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity) on measuring developer productivity. Gergely’s [writing about DORA, and SPACE](https://newsletter.pragmaticengineer.com/p/developer-productivity-a-new-framework) is interesting, but I wonder if metrics can be more granular, around this unit of work, and its affordances. That would shift-left the feedback on productivity, to where it matters.
* I love this last line in [Kent Beck’s answer](https://tidyfirst.substack.com/p/measuring-developer-productivity-440): “Weekly delivery of customer-appreciated value is the best accountability, the most aligned, the least distorting”.
