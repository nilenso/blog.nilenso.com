---
title: I built an AI prototype that can participate in our internal meetings
kind: article
author: Atharva Raykar
created_at: 2025-01-13 00:00:00 UTC
layout: post
---
The funny thing about artificial intelligence is that the astonishing amount of intelligence we have today is terribly underutilised. The bottleneck is integration, not intelligence.

In our weekly all-hands meeting, we usually assign a person to take notes of what's being discussed and spell out the outcomes, owners and action items when the meeting ends. Sometimes this person may pull out important context from previous meetings by looking at older notes. It's valuable grunt work.

Why not drop an AI assistant straight into our Google Meet calls?

I'm not quite satisfied with how AI integrations in meetings are mostly about summarising things after the fact. The process of ensuring that a meeting goes well as it happens is far more valuable than a summary. It's about ensuring things stay focused, and the right information and context is available to all participants.

LLMs (Large Language Models) are mainstream because of interfaces like ChatGPT—you type something, wait a bit, and get text back. Far fewer people know that models can also natively work with audio. They can process speech directly, understand the nuances of conversation, and even respond with natural-sounding voice. The challenge is: how do we actually plug this intelligence into our existing tools?

That's what this project explores. I quickly built a bot that:

* Joins Google Meet calls like a regular participant
* Listens to everything being said
* Takes notes automatically in our Notion workspace
* Responds verbally when addressed directly
* Can potentially handle meeting-related tasks like setting reminders or assigning action items
* So many more possibilities actually. More on this later when I wax philosophical at the end.

*video demo goes here*

As you can see in the demo, the product is nowhere near production quality–it particularly struggles to handle the transition between taking notes and talking to participants, but it shows a lot of promise. I don't see a fundamental limitation in its ability to use tools well enough.

## System Overview

![system diagram: lenso](/images/blog/lenso_diagram.webp)

Looking at the diagram above, we have three main components:

1. **Browser Automation**: Using Puppeteer to control a Google Chrome instance that joins the Meet call
2. **Audio Pipeline**: Converting between different audio formats and managing virtual devices
3. **Google Gemini Integration**: Handling the actual AI interactions through WebSocket connections

Each of these parts has its own challenges. Let's dive into them one by one.

## Joining a Google Meet is surprisingly tricky

Google Meet wasn't exactly designed with bots in mind. The official APIs don't let you do much. To get our assistant into our call, I came up with this:

* Launch a browser programmatically
* Navigate through Meet's UI
* Handle permissions for microphone and camera
* Capture the audio stream
* Feed our AI's responses back in

The code is simple, but getting there involved some trial and error. Meet's UI elements don't always have consistent selectors, and the timing of operations is crucial. I had some trouble getting the default locator methods of puppeteer to work well, and I ended up resorting to injecting code into the browser that manually queried the DOM to keep things moving.

There's also some subtle edge cases, for example, when you join a meeting with over five participants, you are muted by default. The first version of Lenso was talking without unmuting itself when it joined such meetings!

## The Audio Pipeline

This is where things get interesting. We need to:

1. Capture the audio stream from Meet (I used puppeteer-stream for this, which is a package that uses the Chrome extension API to expose browser audio)
2. Convert it to 16kHz PCM format that Gemini expects
3. Receive Gemini's responses into a buffer
4. Feed that audio data back into Meet through a virtual audio device set up with PulseAudio

The trickiest part was handling the virtual audio devices. We use PulseAudio to create a virtual microphone that can both play our AI's responses and capture them for Meet. Here's a sketch:

```javascript
async createVirtualSource(sourceName = "virtual_mic") {
  this.sourceName = sourceName;

  // Create null sink and store its module ID
  const { stdout: sinkStdout } = await execAsync(
    `pactl load-module module-null-sink sink_name=${sourceName}`,
  );
  this.moduleIds.sink = sinkStdout.trim();

  // Create remap source and store its module ID
  const { stdout: remapStdout } = await execAsync(
    `pactl load-module module-remap-source ` +
      `source_name=${sourceName}_input ` +
      `master=${sourceName}.monitor`,
  );
  this.moduleIds.remap = remapStdout.trim();

  // Set as default source
  await execAsync(`pactl set-default-source ${sourceName}_input`);

  return sourceName;
}
```

And to "speak" into this mic:

```javascript
writeChunk(chunk) {
  // Guard against uninitialized stream
  if (!this.pacat || !this.isPlaying || this.pacat.killed) {
    return false;
  }

  // Append new chunk to processing buffer
  const newBuffer = new Uint8Array(this.processingBuffer.length + chunk.length);
  newBuffer.set(this.processingBuffer);
  newBuffer.set(chunk, this.processingBuffer.length);
  this.processingBuffer = newBuffer;

  // Split into fixed-size buffers
  while (this.processingBuffer.length >= this.bufferSize) {
    const buffer = this.processingBuffer.slice(0, this.bufferSize);
    this.playQueue.push(buffer);
    this.processingBuffer = this.processingBuffer.slice(this.bufferSize);
  }

  // Write queued buffers to audio stream
  try {
    while (this.isPlaying && this.playQueue.length && !this.pacat.killed) {
      this.pacat.stdin.write(this.playQueue.shift());
    }
    return true;
  } catch (error) {
    return error.code === "EPIPE" ? false : error;
  }
}
```

I'm sure seasoned audio developers can make this a lot better, but this worked well for the prototype I built.

The browser automation effectively thinks that it's getting audio from the system microphone, but it's a mock microphone. I'm using `pacat` to feed audio bytes from Gemini's API to "speak" into the microphone. If I had the time, I'd have much spent time on better ways to do this, but I wanted a proof of concept out in a week. Using the simplistic `pacat` also called for some ugly hacks to allow users to interrupt our bot.

## The AI Integration

Now for the fun part - making our bot actually intelligent. We use Gemini (Google's multimodal AI model) through a WebSocket connection for real-time communication. The bot needs to:

* Process incoming audio continuously
* Understand when it's being addressed
* Generate appropriate responses
* Manage tool calls for tasks like note-taking

Here's how we set up the AI's personality:

```javascript
const systemInstruction = {
  parts: [{
    text: `You are a helpful assistant named Lenso (who works for nilenso, a software cooperative).
You have two modes of operation: NOTETAKING MODE and SPEAKING MODE.

NOTETAKING MODE: This is your default mode. Be alert about when you need to switch to SPEAKING MODE.
When you hear someone speak:
1. Use the ${this.noteTool.name} tool to record the essence of what they are saying.
2. DO NOT RESPOND WITH AUDIO.

SPEAKING MODE: Activated when you're addressed by your name.
You may respond only under these circumstances:
- You were addressed directly with "Hey Lenso", and specifically asked a question. Respond concisely.
- In these circumstances, DO NOT USE ANY TOOL.

Examples of when to respond. When any meeting participant says:
- "Hey Lenso, can you..."
- "Lenso, will you note that down?"
- "Lenso, what do you think?"

Examples of when to use ${this.noteTool.name}:
- "Lenso, will you note down what we just spoke about?"
- "Hey <someone else's name>, ..."
- "...<random conversation where the word 'Lenso' is not mentioned>..."

Remember that you're in a Google Meet call, so multiple people can talk to you. Whenever you hear a new voice, ask who that person is, make note and only then answer the question.
Make sure you remember who you're responding to.`
  }]
};
```

I didn't spend much time at all on this prompt. Anyone who has built an AI application knows the importance of [prompt engineering](https://arxiv.org/pdf/2406.06608) supported by strong evals, so consider the fact that the meeting bot proof of concept is nowhere near the level of intelligence it actually could be having.

Oh, and I haven't even done any evals. But hey, I made this in a week. If this was a serious production-use project, I'd strongly emphasise the importance of engineering maturity when baking intelligence into your product. (this should link to the govind article. govind pls wrap this up)

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

The way the Gemini API works is that it will send us a "function call" with the arguments. I can extract this call, and actually perform it in our system (for now I dump notes in a text file) and return the response back to the model if needed and continue generation.

What's great about a live API like this is that it's a two-way street. The model can be listening or talking back while also simultaneously performing actions. I really like that you can interrupt it and steer the conversation. The client and server is constantly pushing events to each other and reacting on them, rather than going through a single-turn request-response cycle.

## Limitations

So are we there yet? Is it possible to have these AI employees join our meetings and just do things?

Given how far I could get in a week, I think it's only a matter of time that we'll see more AI employees show up in meetings. There's a few notable limitations to address though:

* The security situation is currently quite bad. The more we give models access to the real world outside, the more we expose it to malicious prompt injection attacks that can hijack the model and make it do bad things. Models are currently very gullible. We can't build serious agents without mitigating this problem.
* Currently, the API only supports 15 minute interactions. After which the model has to reconnect and lose context. We also know that context windows (ie, the effective "memory" of a language model in an interaction) degrades as it gets more crowded over time. This can potentially be mitigated through good quality data retrievals baked into the integration.
* The bot does not currently match voice to person. This context needs to be fed to it somehow. One way I could think of is to observe the blue boxes when someone is speaking to infer who the voice belongs to.
* The models are currently forced to respond to everything it hears. I am currently working around it by cutting off the audio stream whenever it responds with a note-taking tool call.
* I don't like how it pronounces my name.

## Costs?

I used the Gemini Flash 2.0 Experimental model, which is free to try for development purposes. We still don't know how much it costs in production.

But I can speculate. Gemini 1.5 Flash, the previous model in the series is $0.075/million input tokens. Google's docs say that audio data takes up 32 tokens per second.

Even if we assume that the new model is 10x more expensive, our meeting bot would cost less than a dollar for actively participating in an hour-long meeting.

Intelligence is cheap.

## Beyond the scrappy fiddle

This prototype barely scratches the surface. Off the top of my head, I can think of all of these things that are possible to implement with the technology we have today.

* Integrate it with calendar apps for scheduling.
* Let it set up reminders for you.
* Allow it to browse the web and scrape information for you during the meeting.
* Recall what was said in previous meetings.
* Screen sharing understanding.
* Critique a proposal.
* Delegate to an inference-time reasoning model to solve hard problems.

## Reflections on the state of AI

Firstly, multimodality is a huge value unlock waiting to happen. Text-only interfaces are limiting. Natural conversation with AI feels quite different. Humans use a lot of show-and-tell to work with each other.

More importantly, integration is everything. A lot of the intelligence we have created often goes to waste, because it exists in a vacuum, unable to interact with the world around it. They lack the necessary sensors and actuators (to borrow terminology I once read in Norvig and Russell's seminal AI textbook).

It's not enough for our models to be smart. They need to be easy and natural to work with in order to provide value to businesses and society. That means we need to go beyond our current paradigm of chatting with text emitters.

---

## Appendix A

The code for Lenso is [here](https://github.com/nilenso/meeting-bot).

This is prototype quality code. Please do not let this go anywhere near production!

---

## Appendix B

There's a couple of frameworks that I've found to help build realtime multimodal GenAI apps. I haven't been able to try them out:

* [Pipecat](https://pipecat.ai)
* [LiveKit Agents](https://docs.livekit.io/agents/)
