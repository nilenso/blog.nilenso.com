---
title: My GenAI workflow for building a voice assistant
kind: article
author: Sezal Jain
created_at: 2025-01-30 00:00:00 UTC
layout: post
---
This started with a challenge to myself to learn a new framework, something significantly different from what I know. **And doing this using GenAI.** It was a pretty cool process, and I think it could help anyone trying to learn a new language or framework.

*What am I building*: A Flutter app for a ChatGPT driven voice assistant (Coding a GenAI based mobile app with a GenAI coding assistant while learning app development via GenAI. 🌟 Inception achieved! 🌟)

*What I used:*

* Cline: A VSCode coding assistant plugin using anthropic LLM apis, with a claude-3-5-sonnet model
* ChatGPT 4o mini: Conversational AI model, used here for learning about flutter.

*See the open source code for Swara mobile app [here](https://github.com/nilenso/swara-ai)*

## Learn basic building blocks

Diving in, first you need to understand where you are. Read about the basics, and I don’t mean syntax here, which is the approach taken by many language docs. GenAI can give you a better overview based on your preferences.

- - -

**Prompt**

```
Flutter Basics: Talk to me about the structure of a project, build flow, how I run a project. 
How are simulators used to run and debug an iOS/android app
```

- - -

This gave me an idea of what the application flow through the code is and what tools are used during development. It also enabled me to focus on the right sections of the code while starting development.

*Some useful basic concepts I learnt*: 

* `/lib` folder contains the main app code written in dart and  the `main.dart` file is the entrypoint to the app. 
* ios and android folders have platform specific directories for customized platform specific code and I can safely ignore these directories in the beginning.

The response also mentioned flutter devtools to monitor performance, widget tree etc for debugging. Here I prompted for more details, setting up devtools, what its different panels are used for.

This went quite fast for me as I am an experienced dev with multiple languages and frameworks in my bag. If you’re new to this, **take your time here**. Make sure you really get the basic concepts because it makes everything else easier. It's okay to **dig deeper** into anything that's not clear.

## Setup skeleton project

Next up, I wanted to get my hands dirty, so I used Cline (you could use a flutter command line tool as well) to create a skeleton project. I asked it to create a basic Flutter app with the recommended structure.

- - -

```
A skeleton project is something which enables you run a minimal example.
The most famous skeleton project is `Hello World` in any language. 
```

- - -
<img src="/images/blog/genai-workflow/flutter_skeleton_app.png" alt="A flutter skeleton app to count button clicks" class="bucket-image" style="margin: auto">


Walking through the files that were created helped me understand the different pieces of the puzzle. I then ran the build process, launched the simulator, and checked out DevTools with the basic app. This way, I made sure everything was working correctly end-to-end. Also, setting up the project required installing Flutter, CocoaPods, and some plugins as prompted by the command line tool. Getting this initial setup right made me feel like I was on the right track.

## Inform yourself about best practices

Along with the basics, it’s also useful to look at best practices in that field.

**Prompt**

```
Consider me a newbie building a Flutter app. What are some good practices to follow while structuring widgets. 
Share any additional important advice to follow while using flutter
```

- - -

In the response there were very useful practices like:

* Minimize the number of widgets that rebuild, call setState wisely on a widget. Avoid rebuilding entire widget trees
* Use small reusable components which can be tested

It is good to get a general understanding of these best practices, but don't spend too much time on this at the start. It's honestly easier to really understand them once you’ve started coding and you can see why they’re useful. This remains the same whether you are using genAI for coding or doing it yourself.

## Define Your Initial Project Structure

Now, before writing any actual code, I took some time to plan out what I wanted to build. Starting from a high level, I wrote down the functionalities needed and their priority while drawing out a base design of what the app would look like. 

This is something you would do even without AI, and it was especially useful because GenAI lets you iterate quickly. Spending a bit more time on this helped me write more focused prompts and avoid going in circles with refactoring.

## Finally: Code Away!

Finally, it was time to code! This is where things get more specific to what you’re building. Here are some general tips from my experience:

* Run your application frequently, especially after making changes, to ensure you're on the right track. Debugging is easier when addressing issues caused by smaller, isolated changes.
* **Understand the code being written**. This will help you debug when needed, and you’ll start to see patterns. You need to be able to debug when necessary.
* **Use Git** to commit what works and keep track of your progress. Since GenAI can be a little unpredictable, it’s good to track your milestones, to be able to revert to an earlier working version if something goes wrong.

So that’s my experience learning Flutter with GenAI. I hope you find these tips helpful in your own journey!


## Some prompt examples
<img src="/images/blog/genai-workflow/prompt1.png" alt="Initial prompt to create a flutter app" class="bucket-image" style="margin: auto">

<img src="/images/blog/genai-workflow/prompt2.png" alt="Start modifying the skeleton app" class="bucket-image" style="margin: auto">

<img src="/images/blog/genai-workflow/prompt3.png" alt="Enable a testing workflow via UI" class="bucket-image" style="margin: auto">

<img src="/images/blog/genai-workflow/debug_prompt.png" alt="A flutter skeleton app to count button clicks" class="bucket-image" style="margin: auto">
