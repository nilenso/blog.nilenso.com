---
title: "Spreadsheets and Small Software"
kind: article
created_at: 2023-11-10 13:40:00 UTC
author: Prabhanshu Gupta
layout: post
---

A few months back, I did some casual home renovation planning with my dad in a Google Sheet. I was crunching a variety of numbers and soon it got pretty messy. Adding new data and updating formulas became a chore. Checking my calculations became hard. Something was off. As a software engineer, I like to write and appreciate <em>good</em> software (no, I pine for it) – software that is easy to work with, easy to understand, amenable to change, and reliable. The sheet was none of these things.


How did I end up with an unwieldy spreadsheet? How could I fix it? Was this a common problem? I was compelled to take a close look and so I’ve been knee-deep in spreadsheet literature since. This is a quick summary of the things I’ve found, some of my thoughts and what I’ve been up to with them.

## Who are spreadsheets for?

Everyone uses them for all kinds of things; teachers, accountants, scientists, financiers, my father, and so on. Every small business has at least one Very Important Excel file. Big organizations email them back and forth all day. I can get stuff done in spreadsheets and I like them very much. I wouldn’t plan a home renovation anywhere else. Nothing else fits. But annoyances are plenty and as my problems start to grow in size, things get out of hand quickly.

If you’ve spent enough time on a sheet you’ve seen these: a copy-paste error, a few rows at the bottom missing from an average[^1], finicky date formats, a relative/absolute referencing mixup, cryptic VLOOKUPs, INDEX-MATCHes, workarounds for circular references[^2] and mega-formulas[^3].

Thus spreadsheets occupy a weird spot in software culture. Programmers like myself find them endearing, at the same time frustrating because we’ve used better tools[^4]<sup>, </sup>[^5]. End users find them indispensable because they can get work done there. Real software is expensive to make and domain experts can quickly get to working programs that solve their problems.

## Spreadsheets and End User Programming

Much has been said about programming in spreadsheets so I’ll keep it short. Spreadsheet usage falls in any intersection of Storage, Presentation and Computation needs.
<br>
<br>
<img src="/images/blog/spreadsheets-and-small-software/image4.png" width="50%" style="margin: auto" alt="alt_text">

People don't always do all three all the time. Spreadsheets are predominantly used for storage and presentation only – to make lists and lay out tables (todo lists, project management trackers, etc). Most spreadsheets don’t contain any formulas at all[^6].

For the (potential minority) of users whose work falls in the computation circle though they’re uniquely powerful. Nardi & Miller ascribe the power to[^7].

<ul>
	<li>A limited set of carefully chosen, high-level, task-specific operations that are sufficient for building applications within a restricted domain, and </li>
	<li>A strong visual format for structuring and presenting data.</li>
</ul>

Additionally, the live recalculation provides quick feedback loops. The program also runs anywhere with no setup involved. Those things are rare to come by these days.


## My spreadsheet problem

My dad had decided to get a whole bunch of furniture made (like we all do at some point in our lives). New beds, doors, chairs, closets. A carpenter was hired. I was tasked with tracking finances for the whole thing.


By the end of the exercise, there were half a dozen worksheets, a few kinds of formulas and a couple of pivot tables. The work finished over a couple of weeks. We paid out the carpenter from the math I did on the sheet.


These are the problems I ran into

<ul>
	<li>I made a master list of furniture items and some summaries out of it (the total material costs, total cost of labor, a pivot table for costs summed by furniture type etc). Each time new items were added to the list, I had to remember to adjust the summary formulas and the pivot table (The solution here was to refer to all rows till the bottom of the master list sheet in formulas). </li>
	<li>The cost of each furniture item depended on the wood used. The wood prices were in a separate list but it wasn’t easy to “look up” these prices (The solution was an INDEX/MATCH formula). </li>
	<li>Going from wood used I could not declare a formula for the area. All my formulas. (Google sheets has added named functions since then. Excel has had lambdas for a while. But could this be easier?) </li>
	<li>The trail of numbers, so to say, was hard to trace. Who was to say I hadn’t missed a few numbers or multiplied the wrong numbers? This was important when the contractor wanted to cross-check my arithmetic. </li>
</ul>
	
## Small Software


Here are some more sheets similar to mine. A small company tracking its employees and salaries <img src="/images/blog/spreadsheets-and-small-software/image3.png" style="display: inline" width="40px" alt="alt_text">[^8], a personal stock portfolio <img src="/images/blog/spreadsheets-and-small-software/image6.png" style="display: inline" width="40px" alt="alt_text">[^9], a scientist cleaning up some data <img src="/images/blog/spreadsheets-and-small-software/image5.png" style="display: inline" width="40px" alt="alt_text">[^10], a crypto mining profit tracker <img src="/images/blog/spreadsheets-and-small-software/image2.png" style="display: inline" width="40px" alt="alt_text">[^11], a financial model for an educational trust.[^12]


These sheets are like regular programs in many ways. Felienne Hermans, a veteran spreadsheet researcher, puts it very simply: Spreadsheets are code[^13]. She also goes on to show that they suffer from the same problems as real software. The question then is: why don’t we treat spreadsheets like real software?

<p style="text-align: center"> ❖ </p>


Simplistically, information systems are a place to put some information, do transformations on it (optionally) and look it up later[^14]. A cash register, a cab booking app, a payment gateway, a search engine are all information systems in that sense. These sheets particularly are small information systems. I’m going to call them <em>small software</em>. Other names have been used synonymously (personal software, organizational software, end-user programs) but to me <em>small</em> captures the vibe well. It’s the need for dependable, good quality programs that are easy to work with, except their size – in surface area and complexity – is small.


I distinguish <em>small</em> from <em>big</em> to illustrate the kind of building tools needed. As an analogy, think of the tools you’d need to build a small shed as opposed to building a skyscraper[^15]. 

<div style="display: grid; grid-template-columns: 1fr 2fr;">
  <div style="display: grid; align-items: end">
    <img src="/images/blog/spreadsheets-and-small-software/image7.png" style="display: inline" alt="alt_text">
  </div>
  <div style="margin-left: 10px; display: grid; align-items: end;">
    <p style="text-align: justify"> Even though a building is being constructed in both cases, one might say they are completely different activities. Imagine having only the equipment to build a skyscraper but wanting to build a shed. <br><br>Now imagine working on the shed with just a hammer. The building process becomes painful in either case.
    </p>
    

    <div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr;">
      <img src="/images/blog/spreadsheets-and-small-software/image1.png" width="250px" alt="alt_text">
      <div style="display: grid; align-items: center">
        The tools for building small things need to be simple, few, and effective.

    </div>
    </div>
  </div>
</div>

## Spreadsheets in 2023

If we’ve posited that spreadsheets are small software, how do they fare on these qualities? Consider the following

<ul>
	<li>Spreadsheet software is fully backward compatible to prevent breakage in old sheets, to the extent that newer ones have mimicked bugs from older ones [^16]. Change is <em>accretive</em> and almost no features have been discarded in the last couple of decades [^17].</li>
	<li>The Excel formula language is universal. All sheet programming works more or less the same way, with some variation in look and feel. There are some distinctive features: Microsoft Excel has VBA, Apple Numbers does tables differently, Google Sheets is good at collaboration and forms. But there are no spreadsheet formula <em>dialects</em>.</li>
	<li>Any other way of writing sane and functional programs requires a big commitment to learn and get it working. The choice is between the scrappy utilities in spreadsheets and installing Python on your computer.</li>
	<li>As a symptom, errors in spreadsheets are commonplace and a big problem. There’s a name for it – Spreadsheet Risk Management. There’s an <a href="https://eusprig.org/">interest group</a> that tackles problems in this area and <a href="https://www.perfectxl.com/">many</a> <a href="https://www.i-nth.com/">consulting</a> <a href="https://incisive.com/solutions-for-microsoft-excel/">firms</a> that teach how to make good spreadsheets. Spreadsheet errors can cause damage very much like real software. What makes them more unfortunate is that they’re far more pervasive.</li>
</ul>

Over the years, software people have arrived at some must-haves to build reliable and maintainable information systems. We like to use good languages, write tests, peer review our programs etc. Very little of this has made its way to spreadsheets so it’s not surprising they’re

<ul>
	<li>Easy to spike in but hard to maintain and audit.</li>
	<li>Ridden with errors, universally.</li>
	<li>Hard to build robust processes around.</li>
	<li>Harder to use than they should be. </li>
</ul>

## In closing

One, I think the spreadsheet medium is nascent, by the measure of how much has and hasn’t been tried out. There are many bad primitives and very few guardrails. We don’t get a new spreadsheet every year. We do this with programming languages all the time. And I don’t think it’s reasonable to expect mainstream spreadsheets to address this.


<a href="https://rows.com/">New spreadsheets</a> or <a href="https://www.airtable.com/">spin-offs</a> that try to solve these problems usually depart from the spreadsheet recipe in some significant way. <a href="https://datarabbit.com/">Dataflow</a> <a href="https://joshuahhh.com/projects/pane/">programming</a> and <a href="https://sdg.csail.mit.edu/projects/espalier">experimental spreadsheets</a> have their own place but they are all <em>something</em> <em>different</em>.


Secondly, I think patching &lt;your favorite programming language> on top does not work well. Each language brings its abstractions and ways of working, some of which may be at odds with the spreadsheet paradigm. Translating between paradigms has a real cost that a user has to bear. Users also realize that there are too many languages in spreadsheets already and more of them is a problem[^18].


Thirdly, I think more people should be implementing their own spreadsheet software. These things are probably not showing up in popular spreadsheets anytime soon

<ul>
	<li>A simple and expressive formula language that supports its contexts of use.</li>
	<li>Good data structures that provide organization but don’t get in the way[^19].</li>
	<li>Functions as a tool for problem solving, not just a place to tuck away gnarly formulas.</li>
	<li>Tools to deal with change – Tests and Version control.</li>
	<li>Good interop with other languages.</li>
</ul>

So we’re <a href="https://github.com/nilenso/bean">writing a spreadsheet</a> at nilenso to play around with some of these ideas. The plan is to write about the proceedings as we go. …. At the very least, it would be useful to figure out implementation and put that out.


Most importantly, I think spreadsheets still hold the promise of a well-formed small software-making environment; where the medium, the language, and the tooling works as one.


## References
<ul>
	<li>Elisabetta Boaretto, "Uncovering varied pathways to agriculture," <em>Ancientfoods </em>(blog), 20 December, 2017, https://ancientfoods.wordpress.com/2017/12/20/uncovering-varied-pathways-to-agriculture/.</li>
</ul>

## Footnotes

[^1]: <a href="https://leancrew.com/all-this/2013/04/spreadsheet-programming-problems/">https://leancrew.com/all-this/2013/04/spreadsheet-programming-problems/</a>
[^2]: <a href="https://www.youtube.com/watch?v=k5rG_MvIWWs">https://www.youtube.com/watch?v=k5rG_MvIWWs</a>
[^3]: <a href="https://flylib.com/books/en/3.427.1.132/1/">Mega-formulas</a>
[^4]: <a href="https://dl.acm.org/doi/pdf/10.1145/130981.130982">real users don't use spreadsheets</a>
[^5]: <a href="https://twitter.com/rsnous/status/1669928664736178177">rsnous tweet</a>
[^6]: <a href="https://www.joelonsoftware.com/2012/01/06/how-trello-is-different/">joel spolsky footnote</a>
[^7]: <a href="https://www.miramontes.com/writing/spreadsheet-eup/">miramontes</a>
[^8]: <a href="https://www.youtube.com/watch?v=0nbkaYsR94c">joel spolsky suck at excel</a>
[^9]: <a href="https://kevinlynagh.com/financial-plan/">kevinlynagh stocks</a>
[^10]: <a href="https://www.youtube.com/watch?v=yfQ1mQMTpn0">cleaning up data</a> 
[^11]: <a href="https://docs.google.com/spreadsheets/d/1le_dUMXG0HGLFg9jv5_UUtBwTPjXCNN0X3k3SHUgLYQ/edit#gid=91163342">crypto mining</a>
[^12]: <a href="https://www.youtube.com/watch?v=1jS1W_H3Ncg">trust financial model</a>
[^13]: <a href="https://www.youtube.com/watch?v=0yKf8TrLUOw">spreadsheets are code</a>
[^14]: <a href="https://www.britannica.com/topic/information-system/Computer-software">britannica inf system</a>
[^15]: I stole this analogy from a tweet that I can’t find now.
[^16]: <a href="https://learn.microsoft.com/en-us/office/troubleshoot/excel/wrongly-assumes-1900-is-leap-year">mimicked bugs from older ones</a>
[^17]: There’s something to be said about how the rise of the finance industry has shaped the evolution of spreadsheet software. I’ll not say much but leave <a href="https://www.youtube.com/watch?v=toSRmKKiosQ&t=2650s">this bit</a> from a show I thoroughly enjoyed watching.
[^18]: <a href="https://youtu.be/whzmtv9qfIQ?feature=shared&t=719">chandoo</a>
[^19]: https://advait.org/files/chalhoub_2022_data_structuring.pdf

