---
title: I built an AI prototype that can participate in our internal meetings (in
  a week)
kind: article
author: Atharva Raykar
created_at: 2025-01-13 00:00:00 UTC
layout: post
---
The funny thing about artificial intelligence is that the astonishing amount of intelligence we have today is terribly underutilised. The bottleneck is integration, not intelligence.

In our weekly all-hands meeting, we usually assign a person to take notes of what's being discussed and spell out the outcomes, owners and action items when the meeting ends. Sometimes this person may pull out important context from previous meetings by looking at older notes. It's valuable grunt work.

Why not drop an AI assistant straight into our Google Meet calls?

I'm not quite satisfied with how AI integrations in meetings are mostly about summarising things after the fact. The process of ensuring that a meeting goes well as it happens is far more valuable than a summary. It's about ensuring things stay focused, and the right information and context is available to all participants.

Today's AI can hear you speak, understand context, and talk back naturally. Here's how I built this in about a week.

_video demo goes here_

LLMs (Large Language Models) are mainstream because of interfaces like ChatGPT - you type something, wait a bit, and get text back. Far fewer people know that models can also natively work with audio. They can process speech directly, understand the nuances of conversation, and even respond with natural-sounding voice. The challenge is: how do we actually plug this intelligence into our existing tools?

That's what this project explores. I built a bot that:
- Joins Google Meet calls like a regular participant
- Listens to everything being said
- Takes notes automatically
- Responds verbally when addressed directly
- Can potentially handle meeting-related tasks like setting reminders or assigning action items
- So many more possibilities actually. More on this later when I wax philosophical at the end.

Let me give you a sketch of how I made this.

## System Overview

_TODO: Diagram_

Looking at the diagram above, we have three main components:

1. **Browser Automation**: Using Puppeteer to control a Google Chrome instance that joins the Meet call
2. **Audio Pipeline**: Converting between different audio formats and managing virtual devices
3. **Google Gemini Integration**: Handling the actual AI interactions through WebSocket connections

Each of these parts has its own challenges. Let's dive into them one by one.

## The Browser Challenge

Google Meet wasn't exactly designed with bots in mind. The official APIs don't let you do much. To get our assistant into our call, I came up with this:
- Launch a browser programmatically
- Navigate through Meet's UI
- Handle permissions for microphone and camera
- Capture the audio stream
- Feed our AI's responses back in

Here's a sketch of how we handle the join process:

```javascript
async joinMeeting(meetLink) {
  await this.page.goto(meetLink, { waitUntil: "networkidle0" });
  
  // Click through the initial dialog
  await this.page.waitForSelector("::-p-text(Got it)");
  await this.page.click("::-p-text(Got it)");
  
  // Enter the bot's name
  const nameInputSelector = 'input[aria-label="Your name"]';
  await this.page.waitForSelector(nameInputSelector);
  await this.page.type(nameInputSelector, "Lenso");
  
  // Find and click the join button
  const joinButtonSelectors = [
    "button[data-join-button]",
    'button[aria-label="Ask to join"]',
    'button[jsname="Qx7uuf"]'
  ];
  
  // Try multiple selectors because Meet's UI can be inconsistent
  let joinButton = null;
  for (const selector of joinButtonSelectors) {
    joinButton = await this.page.$(selector);
    if (joinButton) break;
  }
  
  await joinButton.evaluate((b) => b.click());
}
```

The code is simple, but getting here involved some trial and error. Meet's UI elements don't always have consistent selectors, and the timing of operations is crucial.

## The Audio Pipeline

This is where things get interesting. We need to:
1. Capture the WebM audio stream from Meet (I used puppeteer-stream for this, which is a package that uses the Chrome extension API to expose browser audio)
2. Convert it to 16kHz PCM format that Gemini expects
3. Take Gemini's responses and convert them to 24kHz PCM
4. Feed that back into Meet through a virtual audio device (set up with PulseAudio)

The trickiest part was handling the virtual audio devices. We use PulseAudio to create a virtual microphone that can both play our AI's responses and capture them for Meet:

```javascript
async createVirtualSource(sourceName = "virtual_mic") {
  // Create a null sink
  const { stdout: sinkStdout } = await execAsync(
    `pactl load-module module-null-sink sink_name=${sourceName}`
  );
  
  // Create a remap source
  const { stdout: remapStdout } = await execAsync(
    `pactl load-module module-remap-source ` +
    `source_name=${sourceName}_input ` +
    `master=${sourceName}.monitor`
  );
  
  // Set as default source
  await execAsync(`pactl set-default-source ${sourceName}_input`);
}
```

The browser automation effectively thinks that it's getting audio from the system microphone, but it's a mock microphone. I'm using `pacat` to feed audio bytes from Gemini's API to "speak" into the microphone. If I had the time, I'd have much cleaner and better ways to do this, but I wanted a proof of concept out in a week. Using `pacat` involved some hacks when I wanted to allow the user to interrupt our bot.

## The AI Integration

Now for the fun part - making our bot actually intelligent. We use Gemini (Google's multimodal AI model) through a WebSocket connection for real-time communication. The bot needs to:
- Process incoming audio continuously
- Understand when it's being addressed
- Generate appropriate responses
- Manage tool calls for tasks like note-taking

Here's how we set up the AI's personality:

```javascript
const systemInstruction = {
  parts: [{
    text: `You are a helpful assistant named Lenso (who works for nilenso, a software cooperative).
When you hear someone speak:
1. Listen carefully to their words
2. Use the ${this.noteTool.name} tool to record the essence of what they are saying
3. DO NOT RESPOND. If you have to, just say "ack".

You may respond only under these circumstances:
- You were addressed by name, and specifically asked a question.
- In these circumstances, DO NOT USE ANY TOOL.

Remember that you're in a Google Meet call, so multiple people can talk to you. Whenever you hear a new voice, ask who that person is, make note and then only answer the question.
Make sure you remember who you're responding to.

ALWAYS use the ${this.noteTool.name} tool when nobody is addressing you directly. Only respond to someone when you are addressed by name.`
  }]
};
```

I spent a cool ten minutes to make this prompt. Anyone who has built an AI application knows the importance of prompt engineering (nb, link to that research paper about it), so consider the fact that the meeting bot proof of concept is nowhere near the level of intelligence it actually could be having.

Oh, and I haven't even done any evals. But hey, I made this in a week. If this was something that's far more serious, I'd seriously emphasise the increased importance of engineering maturity when baking intelligence into your product.

The tool system is particularly interesting. Instead of just chatting, the AI can perform actions:

```javascript
const noteTool = {
  name: "note_down",
  description: "Notes down what was said.",
  parameters: {
    type: "object",
    properties: {
      conversational_snippet: {
        type: "string",
        description: "JSON STRING representation of what was said"
      }
    }
  }
};
```

The way the Gemini API works is that it will send us a "function call" with the arguments. I can extract this call, and actually do it in our system (for now I dump notes in a text file) and return the response back to the model if needed and continue generation.

What's great about a live API like this is that it's a two-way street. The model can be listening or talking back while also simultaneously performing actions. I really like that you can interrupt it and steer the conversation. The client and server is constantly pushing events to each other and reacting on them, rather than going through a single-turn request-response cycle.

## Limitations

So are we there yet? Is it possible to have these AI employees join our meetings and just do things?

Given that I could get this far in a week, I think it's only a matter of time. There's a few notable limitations to address though:

* The security situation is currently quite bad. The more we give models access to the real world outside, the more we expose it to malicious prompt injection attacks that can hijack the model and make it do bad things. Models are currently very gullible. We can't build serious agents without mitigating this problem.
* Currently, the API only supports 15 minute interactions. After which the model has to reconnect and lose context. We also know that context windows (ie, the effective "memory" of a language model in an interaction) degrades as it gets more crowded over time. This can potentially be mitigated through good quality data retrievals baked into the integration.
* The bot does not currently match voice to person. This context needs to be fed to it somehow. One way I could think of is to observe the blue boxes when someone is speaking to infer who the voice belongs to.
* The models are currently forced to respond to everything it hears. I am currently working around it by cutting off the audio stream whenever it responds with a note-taking tool call.
* I don't like how it pronounces my name.

## Costs?

I used the Gemini Flash 2.0 Experimental model, which is available for free for developers. We still don't know how much it costs in production.

But I can speculate. Gemini 1.5 Flash, the previous model in the series is $0.075/million input tokens. Google's docs say that audio data takes up 32 tokens per second.

Even if we assume that the new model is 10x more expensive, our meeting bot would cost less than a dollar for actively participating in an hour-long meeting.

Intelligence is cheap.

## Beyond the scrappy fiddle

This prototype barely scratches the surface. Off the top of my head, I can think of all of these things that are possible to implement with the technology we have today.

- Integrate it with calendar apps for scheduling.
- Let it set up reminders for you.
- Allow it to browse the web and scrape information for you during the meeting.
- Recall what was said in previous meetings.
- Screen sharing understanding.
- Critique a proposal.
- Delegate to an inference-time reasoning model to solve hard problems.

## Reflections on the state of AI

Firstly, multimodality is a huge value unlock waiting to happen. Text-only interfaces are limiting. Natural conversation with AI feels quite different. Humans use a lot of show-and-tell to work with each other.

More importantly, integration is everything. A lot of the intelligence we have created often goes to waste, because it exists in a vacuum, unable to interact with the world around it. They lack the necessary sensors and actuators (to borrow terminology I once read in Norvig and Russell's seminal AI textbook).

It's not enough that the models we have are smart. They need to be easy and natural to work with in order to provide value to businesses and society. That means we need to go beyond chatting with text emitter.

## Appendix

"Talk is cheap. Show me the code!"

Okay, here you go: _link_

But this is prototype quality code. Please do not let this go anywhere near production!
