---
title: Thought on tldraw computer
kind: article
author: Atharva Raykar
created_at: 2024-12-30 00:00:00 UTC
layout: post
---
tldraw is canvas software that runs on your browser (like MS Paint, excalidraw etc). This project caught my attention when I saw [demos of fun AI experiments with the canvas interface](https://x.com/tldraw/status/1805680673497432472)[^1]. Even the plain canvas software without the experimental AI frills is delightful to use—it's become the default thing I reach for when I want to create diagrams, sketch out an idea or make a presentation.

They recently released their most compelling experiment, [tldraw computer](https://computer.tldraw.com). I think this thirty second video gives a good taste of what this is.
<!--more-->
<iframe width="560" height="315" src="https://www.youtube.com/embed/u1016UnJIgA?si=flc0YCCFbUuqu4bL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

It's a node-and-wire visual programming system. Plenty of those exist[^2]. What makes this one different is that most of the tasks and data shovelling is done with natural language instructions.

Typical computer programs are black boxes for end users. The user sees their desired output for a certain set of inputs, but they don't see how the system works. 

But a tldraw canvas program is transparent—you see how it works as it runs. There are very few, almost no special programming constructs to learn as most of the work is done by natural language. I suspect non-programmers would find it more accessible to work with tldraw, compared to something like [Scratch](https://scratch.mit.edu/), or even spreadsheets.

Because tldraw programs are driven by fuzzy natural language they are far more non-deterministic than normal computer programs. This makes it pretty nice for creating programs that are generative and help augment creativity. Most example programs on the tldraw computer website are like this.

In that vein, I quickly concocted a [writer's block unblocker](https://computer.tldraw.com/t/4KoB33nFEr8cHRTQLsLpYb).

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">i quickly concocted a writer&#39;s block unblocker<br>(with <a href="https://twitter.com/tldraw?ref_src=twsrc%5Etfw">@tldraw</a> computer)<br><br>it&#39;s takes an oblique strategy (from the brian eno et al card deck) and uses it to provide unhinged critique of the essay you are working on to help you break out of a rut <a href="https://t.co/Z0cdpr8J6s">pic.twitter.com/Z0cdpr8J6s</a></p>&mdash; atharva (@AtharvaRaykar) <a href="https://twitter.com/AtharvaRaykar/status/1873280708808155517?ref_src=twsrc%5Etfw">December 29, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

This was building on top of the [Oblique Strategies](https://en.wikipedia.org/wiki/Oblique_Strategies) card deck by Brian Eno and Peter Schmidt—a card in this set has a tiny prompt designed to stimulate creativity and help an artist get out of a rut.

My program simulates a zesty scribe called al-Qalam who pulls out an oblique strategy, reads the essay that you are stuck on and gives you suggestions. The suggestions are often not quite you want—which I think is often what I really need when I'm stuck in a rut. It just needs to spark something.

This is software I would have never been able to create so easily without the [AI canvas khichdi](https://chatgpt.com/share/67717fed-03cc-800a-a964-f53fec308bb5) that tldraw computer offers.


---

[^1]: Also todepond is involved and [todepond is cool](https://bsky.app/profile/todepond.com/post/3ldqf5uirk22r).  
[^2]:  I saw a recent instance of this idea in a demo at the [Bangalore FoC meetup](https://www.notion.so/nilenso-software/FoC-meetup-25th-September-2024-10c0f0425dae80a79583edab0c9fca2a) by [Arvind Thyagarajan's Remix Labs](https://remixlabs.com/blog/intro.html)
