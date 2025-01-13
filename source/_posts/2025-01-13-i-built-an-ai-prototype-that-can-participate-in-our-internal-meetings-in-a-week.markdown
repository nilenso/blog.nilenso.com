---
title: I built an AI prototype that can participate in our internal meetings (in
  a week)
kind: article
author: Atharva Raykar
created_at: 2025-01-13 00:00:00 UTC
layout: post
---
[PS, this is currently slop, but I'll build on this.]

Imagine dropping an AI assistant straight into your Google Meet calls. Not just text chat - it can hear you speak, understand context, and talk back naturally. That's what I built in about a week, with no prior experience in audio programming or Node.js. Here's how it went down.

## The Big Picture

Most of us are familiar with LLMs (Large Language Models) through interfaces like ChatGPT - you type something, wait a bit, and get text back. But the latest models can do so much more. They can process speech directly, understand the nuances of conversation, and even respond with natural-sounding voice. The challenge is: how do we actually plug this intelligence into our existing tools?

That's what this project explores. I built a bot that:
- Joins Google Meet calls like a regular participant
- Listens to everything being said
- Takes notes automatically
- Responds verbally when addressed directly
- Can potentially handle meeting-related tasks like setting reminders or assigning action items

The interesting part isn't just what it does, but how it has to do it. The system needs to juggle multiple streams of audio, handle real-time processing, and maintain context across an entire conversation. Let's break it down.

## System Overview

Looking at the diagram above, we have three main components:

1. **Browser Automation**: Using Puppeteer to control a Chrome instance that joins the Meet call
2. **Audio Pipeline**: Converting between different audio formats and managing virtual devices
3. **Gemini Integration**: Handling the actual AI interactions through WebSocket connections

Each of these parts has its own challenges. Let's dive into them one by one.

## The Browser Challenge

Google Meet wasn't exactly designed with bots in mind. To get our assistant into a call, we need to:
- Launch a browser programmatically
- Navigate through Meet's UI
- Handle permissions for microphone and camera
- Capture the audio stream
- Feed our AI's responses back in

Here's a snippet of how we handle the join process:

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

The code looks simple, but getting here involved a lot of trial and error. Meet's UI elements don't always have consistent selectors, and the timing of operations is crucial.

## The Audio Pipeline

This is where things get interesting. We need to:
1. Capture the WebM audio stream from Meet
2. Convert it to 16kHz PCM format that Gemini expects
3. Take Gemini's responses and convert them to 24kHz PCM
4. Feed that back into Meet through a virtual audio device

Here's how we set up the audio processing:

```javascript
class AudioProcessor {
  constructor() {
    this.inputStream = new BufferToStreamTransform();
    this.outputStream = new BufferToStreamTransform();

    // Set up ffmpeg conversion pipeline
    const command = ffmpeg()
      .input(this.inputStream)
      .inputFormat("webm")
      // Output format settings for Gemini's requirements
      .outputOptions([
        "-acodec pcm_s16le", // 16-bit PCM
        "-ar 16000",         // 16kHz sample rate
        "-ac 1",            // Mono
        "-f s16le",         // Raw PCM format
      ])
      .on("error", (err) => {
        log("FFmpeg error:", err);
        this.outputStream.emit("error", err);
      });

    command.pipe(this.outputStream);
  }
}
```

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
    text: `You are a helpful assistant named Lenso who works for nilenso, 
    a software cooperative. When you hear someone speak:
    1. Listen carefully to their words
    2. Use the note_down tool to record the essence of what they are saying
    3. DO NOT RESPOND unless directly addressed by name
    
    Remember that you're in a Google Meet call, so multiple people can talk 
    to you. When you hear a new voice, ask who that person is.`
  }]
};
```

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

## Real-world Performance

So how does it actually work in practice? Pretty well, with some caveats:

1. **Audio Quality**: The multiple conversions between audio formats can sometimes impact quality, but it's generally good enough for understanding.

2. **Latency**: There's a noticeable delay between someone speaking and the AI responding, mainly due to:
   - Audio processing time
   - Network latency to Gemini
   - Text-to-speech generation

3. **Context Management**: The AI is surprisingly good at:
   - Remembering who's who in the conversation
   - Understanding when it's being addressed
   - Taking relevant notes without interrupting

4. **Integration Challenges**: The biggest issues aren't with the AI itself, but with the integration points:
   - Browser automation can break if Meet's UI changes
   - Audio device management needs proper setup
   - Error handling across the pipeline is complex

## Limitations

## Future Potential

This prototype barely scratches the surface. Some interesting possibilities:

1. **Enhanced Tools**:
   - Calendar integration for scheduling
   - Task management system integration
   - Real-time translation
   - Meeting summarization

2. **Better Context**:
   - Screen sharing understanding
   - Presentation content analysis
   - Gesture recognition
   - Emotion detection

3. **Improved Interaction**:
   - More natural interruption handling
   - Better turn-taking in conversations
   - Proactive suggestions
   - Multiple personality modes

## Key Takeaways

1. **Multimodal is the Future**: Text-only interfaces are limiting. Natural conversation with AI feels fundamentally different.

2. **Integration is Everything**: The AI capabilities exist, but making them work with existing tools is the real challenge.

3. **Real-time is Hard**: Managing streams of data, handling interruptions, and maintaining context in real-time adds significant complexity.

4. **Tools are Powerful**: Giving AI the ability to perform actions rather than just generate responses opens up huge possibilities.

Building this was a fascinating exploration of how we might integrate AI more naturally into our daily tools. The technology is there - now it's about making it work seamlessly in the real world.

Want to try it yourself? The code is all JavaScript/Node.js, and you'll need:
- A Gemini API key
- PulseAudio for audio device management
- FFmpeg for audio processing
- A Google account for Meet access

Just remember: the future of AI isn't just about smarter models - it's about better integration.
