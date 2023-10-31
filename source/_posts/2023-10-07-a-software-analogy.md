---
title: "A Software Analogy"
kind: article
created_at: 2023-10-16 07:16:12 UTC
author: Atharva Raykar
layout: post
---

What contributes to a software product being of high quality and stability? I shall categorise it this way:

* The mapping of abstractions and patterns to the problem.
* Choice of tools and technologies.

Software discourse tends to be disproportionately focused a lot on the latter. I find myself contributing to this skew as well. Perhaps it's because tools and technologies are more concrete and easy to talk about. It's also easy to get people worked up about it.

Yet tools and technologies only exist in service of the first category, which fundamentally capture the highest-value bits of a developer's job—concept mapping. Or making analogies. Pick whichever phrase that makes the most sense to you. I shall present a short motivating example for what I mean by concept-mapping.

## Designing a Sudoku Solver

Suppose you were to write a [Sudoku](https://en.wikipedia.org/wiki/Sudoku) solver. Our first job would be to make an analogy—how do I turn this concept that humans brains understand ("solving sudoku") into a representation that a different processing substrate (here, your computer) can "understand" and process?

There's so many possibilities! Here's three of them.

* The grid is analogous to an ordered list of 81 "places". Each square on the grid would be mapped to a "place" on the list. We get the rows, columns and blocks (ie, the subgrids) for a given square by functions that do some modulo arithmetic on our 81-sized list. We also provide a function that tells us the possible values for each unfilled square.
* The grid is analogous to a table that maps the names of squares to the value it contains. The "name" of a square could encoded just like a spreadsheet—A1 for the first square, A2 for the square to its right and B1 for the square below it. Unfilled squares contain a sequence of all possible values that could be inserted in it, while satisfying the Sudoku constraint.
* The grid is analogous to a regular undirected graph of 81 nodes. Each node is connected to another node that belongs to either the same row, column or block. The solution to the puzzle is analogous to finding a way to assign 9 different colours to all nodes such that no two adjacent nodes have the same colour.

Each analogy lends itself to different problem solving approaches. The choice of analogy will affect a bunch of things like:

* How easy is it to display the puzzle into a human-readable graphic?
* How easy is it to enumerate all possible combinations of game-states?
* How easy is it to propagate constraints (ie, if square X has number 3, then I am sure that there is no other 3 in the row, column or block)?
* How efficient is the representation for the chosen substrate of computation?

## Climbing out of the pit of on-off switches

What I have left out is the enormous amount of analogies that our Sudoku solving analogy is building on top of. Our computing substrate, encodes binary on-off switches (which our hardware is great at representing) to base-2 numbers. These base-2 numbers are itself used to encode computational verbs such as "add", "subtract" or "check if something is zero". These primitives give rise to higher-level procedures like "sort a list" or "turn this language into the instruction set that this procedure is written in". Our Sudoku solving analogy will likely be written in the language that is transitively analogous to a bunch of on-off switches, which mirror what humans understand as "solving a Sudoku puzzle".

What's interesting here is the fact that as we climb out of this pit of analogies, the lower level analogies matter less and less. Indeed, when we were enumerating our ideas to represent a Sudoku board, we weren't thinking of on-off switches, base-2 numbers or even instruction encodings for said numbers. We could safely ignore them, and yet provide meaningful value and understanding of how to tackle this problem.

If you are willing to entertain yet another analogy, the meaninglessness of lower levels is rather eloquently described by Douglas Hofstadter:

> Consider the day when, at age eight, I first heard the fourth étude of Chopin’s Opus 25 on my parents’ record player, and instantly fell in love with it. Now suppose that my mother had placed the needle in the groove a millisecond later. One thing for sure is that all the molecules in the room would have moved completely differently. If you had been one of those molecules, you would have had a wildly different life story. Thanks to that millisecond delay, you would have careened and bashed into completely different molecules in utterly different places, spun off in totally different directions, and on and on, ad infinitum. No matter which molecule you were in the room, your life story would have turned out unimaginably different. But would any of that have made an iota of difference to the life story of the kid listening to the music? No—not the teensiest, tiniest iota of difference. All that would have mattered was that Opus 25, number 4 got transmitted faithfully through the air, and that would most surely have happened. My life story would not have been changed in any way, shape, or form if my mother had put the needle down in the groove a millisecond earlier or later. Or a second earlier or later.

What I am trying to say is that with a good abstraction, it isn't the substrate where the magic is at, it is instead in the interaction or "motions" around the analogy boundaries. In the same way, Chopin's étude is fairly robust to changes in the instrument, record player or performer (assuming all the notes are hit correctly). These changes in the substrate would likely still stir Hofstadter's heart.

If the contracts between the analogy we are making and the analogies we are building on top of remain the same, the substrate broadly does not matter. If we could represent graphs, lists and tables using a computing substrate powered by quantum superpositions, cosmic rays and alignment of chakras instead of base-2 numbers, our Sudoku solving analogies would still hold. Or at least that's the promise that an effective Software developer provides—"my analogy can stand well despite the shifts in the analogies and substrates below it."

Which is why my definition of what a software developer is rather flexible compared to most people. She need not be a desk-jobber who writes a code on a text editor—the substrate is not important—a good software developer uses effective techniques to come up with analogies to solve problems.

## The part where technology does matter

All this is not to say that our choices of technology does not matter—it only matters to the extent where it helps us make effective analogies. For example, I consider Clojure to be a more enjoyable programming language than Go, because I believe the former's expressiveness helps me make more robust analogies. Then again, I also understand that there's a lot more to analogy-making than the programming language I select. A hyperfocus on technologies (especially prevalent in junior developers) distracts from what I consider to be the business of making analogies.

That's it, bye bye.

## Appendix, References etc

* [Fogus and Houser's Sudoku solver from Joy of Clojure](https://github.com/esb-dev/sudoku/blob/main/src/sudoku_joc.clj) uses my first analogy.
* [Norvig's Sudoku Solver](https://norvig.com/sudoku.html) uses my second analogy.
* [The Sudoku Graph analogy](https://en.wikipedia.org/wiki/Sudoku_graph). A bit out of my league, to be honest. I don't know enough graph theory and didn't spend enough time to read this.
* Another fun analogy is to build on top of an analogy that understands "relations". We use one of our representations and put it into a language that returns a "knowledge mapping" of terms that would help satisfy a constraint. Left this one out of the main blog post, because I am currently pretty bad at explaining it. But [here's](https://github.com/clojure/core.logic/wiki/Examples#sudoku) a Sudoku solver that works on miniKanren/core.logic/Prolog(?) analogy modellers, if you are familiar with those (I am not).
* The Douglas Hofstadter quote is from the book _I am a strange loop_ which I highly recommend reading. It inspired most of this essay.

