---
title: AI-assisted coding for teams that can't get away with vibes
kind: article
author: Atharva Raykar
created_at: 2025-05-29 00:00:00 UTC
layout: post
---
AI should be adopted by serious engineering teams that want to build thoughtful, well-crafted products. Doing so is predicated on skillful usage of these tools. Our obsession with building high-quality software for over a decade has driven us to figure out how this new way of building can result in better products.

This living playbook is based on our experience working with AI tools in the messy trenches of production software, where no one can afford to get away with vibes. We hope other teams can learn and benefit from our findings.

## Why build with AI?

**Building with AI is fast**. With the right kind of usage, we have indeed seen massive improvements in velocity for shipping new features. The velocity improvements are not evenly spread. In our experience, the smaller straightforward tasks benefit massively more from AI compared to bigger, gnarlier work such as designing a good system. But the speed-up in the smaller ongoing engineering work helps teams allocate more time and focus on harder problems. Moreover, when velocity increases at an individual level, you can eliminate coordination overhead with leaner teams, which can unlock even more velocity.

This velocity is important, because when harnessed correctly, it allows teams to tighten feedback loops with users faster and make the product better. Any team that does not adopt AI tools effectively will be outcompeted by teams that ship faster using them.

The hype around the velocity has lead to some people and teams hastily adopting and pushing AI tools, and finding themselves disappointed by the output and quality. There is a good reason for this. AI tools are sophisticated tools that are frankly, difficult to use and unintuitive. Hold it wrong, and you can generate underwhelming results, worse still, slow down your velocity by drowning your project in slop and technical debt. We have seen this play out time after time.

## AI is a multiplier. To make AI good, get good yourself.

* Experienced people get more out of the tools.
    * They are better at communicating technical ideas.
    * They have a keen calibration and feel for what leads to a good system and can steer LLMs accordingly ("the mechanic's touch").
    * They have strong fundamentals, so they immediately get up to speed with new tools and systems where knowledge, not skill is the bottleneck.
    * Therefore, embody the care of a craftperson. At the end of the day, you should produce artifacts you are proud of, even if the AI assisted in making it.
* It is known that AI "sandbags" and will mirror the tastes and sensibilities of the prompter.

## What helps the human helps the AI

* Markers of a high quality team and codebase
    * Test coverage
    * Linting
    * CI/CD
    * Well documented changes, tech specs, ADRs, good commit messages
    * Consistent styles and patterns
    * Simple, concise, well-organised code
    * Clearly defined features, broken down into multiple small story cards
* All these things can and should be leveraged by the LLM to make things "just work".
* Anecdote about how the AI was far better and more efficient in the service that followed these standards, vs the service that did not. AI struggled when the tests and code was a mess and produced even more messy code.

## Tools and techniques in the editor

* Use the best frontier AI models, don't cheap out.
* If there's one takeaway: effectiveness is strongly dependent on how skillfully you can provide the right context to the LLM.
* Use an agentic coding tool. Our current recommendation: Claude Code, Windsurf, Cursor, Cline.
* LLMs can get distracted and fall into rabbitholes. Focus its attention by only @-mentioning files that are relevant. Give it an uncluttered context to work with.
* RULES.md. Symlink to .cursorrules, .windsurfrules, claude.md, agents.md etc
    * It should have information about the tech stack, how to use the dev tooling and run the linter, coding standard and patterns, and cover for common mistakes that the LLMs have made when working with the code.
* Break down the problem. AI works better the more specific you are.
    * If it's a big feature, break it down into small tasks, and feed the tasks one by one, making a commit at the end of each task
    * Supply tech specs and relevant documentation about the product and feature. Don't just ask it to write code without broader context of the product.
    * You can ask the AI itself to break down the problem! Reasoning models are great at this.
    * If you are not sure how to prompt the AI for best results, try asking the model itself.
    * One pattern that works well is to break down the feature into "planning" and "execution" stages.
* Use them to debug.
    * Always paste the error context (I prefer XML tag delineation)
    * Explain what you have tried, and additional observations to help the model generate correct hypotheses and eliminate bad ones. Provide lots of context.
* Do not take AI suggestions for granted. Ask it to justify its choices, present alternatives and think about advantages and drawbacks.


## Tools and techniques outside the editor

* LLMs are an infinitely patient teacher with massive world knowledge (and more recently, ability to research effectively). Aggressively use them to learn things and demystify any new code or stack. Relentlessly dig. Figure out the best practices.
* Create lots of detailed documentation easily by feeding codebases to the LLM. Egs:
    * Explain functionality, create a knowledge base
    * Summarise all the current metrics being collected
    * Identify missing test cases more intelligently
* Create mockservers to coordinate between frontend and backend teams without unblocking each other. All that is needed is agreeing on a contract.
* Create runbooks and guides for infra deployments, common types of troubleshooting and more by supplying shell history sessions to the LLM.
* Have a template for Pull Requests, feed the code diff of each feature to the AI to explain the changes and how to deploy them.
* To reduce time to first PR review, use a code reviewing bot for the first part. But do not replace human review!
* Use researching capabilities to help find solutions to uncommon errors.
* Use LLMs to help you optimise databases and tune configuration. When doing so provide context on the infrastructure and hardware. Share query plans.
