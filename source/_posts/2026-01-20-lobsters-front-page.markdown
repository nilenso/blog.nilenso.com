---
title: How the Lobsters front page works
kind: article
author: Atharva Raykar
created_at: 2026-01-18 00:00:00 UTC
layout: post
---
[Lobsters](https://lobste.rs) is a computing-focused community centered around link aggregation and discussion.

The [code is open source](https://github.com/lobsters/lobsters), so I had a look at how the front page algorithm works.

This is it:

$$\textbf{hotness} = -1 \times (\text{base} + \text{order} \times \text{sign} + \text{age})$$

 $$\text{hotness} \downarrow \implies \text{rank} \uparrow$$

The page is sorted in ascending order by \( \textbf{hotness} \). The more negative the value of \( \textbf{hotness} \), the higher the story ranks.

You can skip straight to the [interactive front page](https://atharvaraykar.com/lobsters/#explore) to help get a feel for the front page dynamics.

## Base

The \( \textbf{base} \) is added to the order term to incentivise certain types of posts, and influence the initial ranking. It is the sum of the hotness modifiers (a value between ( -10 ) and ( +10 ) of all the tags in that story).

$$\textbf{base} = \sum_{t \in \text{tags}} \text{hotness_mod}_t + \begin{cases} 0.25 & \text{if self-authored link} \ 0 & \text{otherwise} \end{cases}$$

Some tags (like `culture` or `rant`) have negative "hotness modifiers", which penalises their initial rank. Authors submitting their own content get a tiny boost, which is mildly surprising given the otherwise strict self-promo rules. The ( \textbf{base} ) has a modest effect on the hotness compared to ( \textbf{order} ) and ( \textbf{age} ).

## Order

The value of ( \textbf{order} ) is derived from the engagement that a story gets.

$$\textbf{order} = \log_{10}\left(\max\left(|\text{score} + 1| + \text{cpoints}, 1\right)\right)$$

The progression of the order term is logarithmic—this means going from 0 to 100 votes increases the rank far more than going from 1000 to 1100 votes.

The ( \textbf{cpoints} ) is added to the story score, which accounts for non-submitter comment upvotes (a comment upvote is worth half a story upvote). If the ( \textbf{base} ) is negative (as is the case for a freshly submitted `rant`), then this term is zeroed, making the comments effectively contribute nothing to the rank.

$$ \text{comment_points} = \begin{cases} 0 & \text{if } \text{base} < 0 \ \frac{1}{2}\sum(\text{comment_scores} + 1) & \text{otherwise} \end{cases} $$

$$ \textbf{cpoints} = \min(\text{comment_points}, \text{story_score}) $$

The ( \textbf{cpoints} ) can never exceed the story score. Therefore, stories that have a low score but lots of highly upvoted comments—perhaps a signature of controversy-generating low-quality submissions—do not get boosted by comment upvotes.

There are some details around merged stories that I am leaving out for the sake of simplifying this explanation. But it roughly does what you'd expect.

## Sign

If a story gets flagged enough to make the story score negatively (a flag is effectively a downvote), the ( \textbf{sign} ) becomes negative.

$$ \textbf{sign} = \begin{cases} -1 & \text{if score} < 0 \ +1 & \text{if score} > 0 \ 0 & \text{otherwise} \end{cases}$$

The ( \textbf{sign} ) negates the effect of comment upvotes when the story scores zero, and make them contribute *negatively* to the rank when the story scores below zero.

## Age

The value of ( \textbf{age} ) is fixed at the time of submission. This is the unix timestamp at which the story was created, divided by a configurable ( \textbf{hotness_window} ) time. The ( \textbf{hotness_window} ) is 22 hours by default—this means that the value of ( \textbf{age} ) increases by ( \text{1} ) unit every 22 hours.

 $$\textbf{age} = \frac{\text{created_at_timestamp}}{\text{hotness_window}}$$

This value grows **linearly** with every newer story, pushing older stories down the rankings. The main tension in this algorithm is the fact that the ( \textbf{order} ) (dictated by score) grows **logarithmically**, so upvotes need to increase exponentially over time to counter the effect of ( \textbf{age} ) in order to stay on the front page. Father time comes for us all.

## In a nutshell

$$\textbf{hotness} = -1 \times (\text{base} + \text{order} \times \text{sign} + \text{age})$$

 $$\text{hotness} \downarrow \implies \text{rank} \uparrow$$

Where ( \textbf{base} ) is initialised based on the tag and who submitted the story. The  ( \textbf{age} ) increases linearly for every new submission and the  ( \textbf{order} ) for a story, as determined by votes, increases logarithmically.

## Explore

Heads up—enable JavaScript to make this part work. This was mostly vibecoded, with me verifying that the results match the algorithm.

<div style="width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right:
 -50vw;">
     <iframe src="https://gisthost.github.io/?2a49b5d2fcb2960ebf3c2e04dd680a3a" width="100%" height="1600"
  style="border: none; max-width: 1100px; display: block; margin: 0 auto;"></iframe>
</div>

There's [a gisthost link](https://gisthost.github.io/?2a49b5d2fcb2960ebf3c2e04dd680a3a) if you want to play with it as a standalone tool.

## Thoughts

The algorithm is solid. It allows new stories to get their time in the sun, and correctly penalises low-quality content that generates a lot of heated discussion. If there is heated discussion, it's usually over highly-upvoted posts. Over time, age always dominates upvotes, so no story can really stick around that long in the front page. There are gates that stop overly flagged stories from making any progress up the ranks.

That said, I don't think the algorithm really makes the site what it is. The character of the site is more the result of its opinionated moderation, narrow computing focus and the gradual acculturation through the invite system. Compared to many other forums, there's less junk and also little outright hostility, racism, sexism or other isms. The community has surfaced lots of niche topics and writers, which I enjoy.

Yet, my experience on the website has been far from ideal. For me, this is rooted in a disconnect of values with the group most engaged on the site, whose votes and discussions drive the climate. I do not appreciate the cynicism worn with pride, the unproductive gotchas, the long polemics that reveal that the commenter hasn't read beyond the title, the throwaway venting and the debates where it is clear that neither side wants to actually refine their world model. It has driven me away from engaging more on the site.

Studying the algorithm has shown me that disengaging would make my problem worse—a single user's participation can be worth a lot. Early upvotes really count, and can easily boost a post to the front page. If you are lurking on the site and are unsatisfied, consider exercising your votes and submissions more. Post the more nuanced, friendly and curious comments that you'd like to see more of. It really does matter. I will likely change how I participate on the site as a result of this.

After all, there aren't all that many relatively quiet and straightforwardly serious public forums to contrast the twitters and HNs of the world that can surface niche computing curiosities.

---

See discussion on [Lobsters](https://lobste.rs/s/ngwloq/how_lobsters_front_page_works) and [Hacker News](https://news.ycombinator.com/item?id=46669996).
