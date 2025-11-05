---
title: Some iterative prompt hacking
kind: article
author: Srihari Sriraman
created_at: 2025-11-04 00:00:00 UTC
layout: post
---
When building [context-viewer](https://blog.nilenso.com/blog/2025/10/29/fight-context-rot-with-context-observability/), I used LLMs to analyse language semantics. I went from 300-word prompts that barely worked to 15-word prompts that worked quite well. I learned about working with LLMs instead of fighting them, and to balance AI with plain old engineering.

 The “secret sauce” is basically:

* Finding out what the model is good (bitter lesson pilled) at, and leaning into its strengths
* Breaking down the problem, or moulding it to fit the strengths
* Engineering around limitations of the model


The 2 main use-cases were in segmentation and categorisation.
1. **Segment**: break apart one prompt, or message into semantically meaningful chunks.
2. **Categorise**: Assign each message a “category” / “component name” so it’s easy to identify it when zooming out to the larger picture.


## Segmentation
The problem here is to pull apart a single message from an assistant, or prompt from the user, into meaningful chunks like various text or code blocks, instructions, files supplied as context, etc.

The input is an AI conversation, or a message array, represented in JSON. I need to preserve the semantic meaning while chunking, and the flow of text too. I can't change the order of text, since that matters to an LLM. Since I’m working with inputs that are prompts or skill markdown files, I was likely to have delimiters that were XML / Markdown, etc.

I wanted to get a list of “splits”, so that I could replace a single message in-place with a list of smaller messages. So, I started with this prompt.

<details>
<summary>
<code>Initial prompt</code>
</summary>

````markdown

Given a structured JSON containing message parts, split any part that combines multiple distinct ideas into smaller, self-contained units. Each resulting unit must represent **one classifiable concept or function**, preserving all meaning, order, and structure. This prepares the data for hierarchical categorization. Output **only** the complete replacements JSON object described.

Return **only** a single JSON object in this format:
{
  "replacements": [
    {
      "source_part_id": "42",
      "target_parts": [
        {
          "id": "42.1",
          "type": same_as_source_type",
          "text": "subpart content 1"
        },
        {
          "id": "42.2",
          "type": same_as_source_type",
          "text": "subpart content 2"
        }
      ]
    }
  ]
}
````
</details>

I pasted this prompt into a ChatGPT conversation, attached a messages.json, and started hacking away, trying to find a prompt that worked reasonably. The issues were:

* It only returned a single replacement most of the times
* I thought this was because I only had one replacement in the sample response. I added two replacements in the response and the issue reduced, but persisted.
* I asked chatgpt why it only returned one replacement. It told me that I had said \*\*any\*\* part, not \*\*all\*\* parts. Silly me. I fixed that, but the issue persisted.
* It tried to use code tools, but I didn’t want it to take so much time (I specifically wanted low latency), and I wanted a generic solution.
* It didn’t return full message chunks, it would snip them with \`…\` in between or write a summary that represented the chunk.
* I additionally instructed it to “output exact text spans”, added principles on why I wanted it that way, etc. No juice.

There were a few other issues around the json structure, preserving additional fields, etc. I also added a couple of guiding examples. 
And at the end of these iterations, here’s the prompt I got to:

<details>
<summary>
<code>Detailed prompt with all the fixes</code>
</summary>

```markdown
## **Task**

Segment a structured JSON containing message parts into **atomic semantic units**.
Each resulting unit must represent a single, self-contained **intent, fact, or function**, suitable for hierarchical categorization.
Preserve all original wording, order, and structure.

---

## **Segmentation Rules**

* Each atomic unit should express **one topic, question, instruction, or operation**.
* If a part contains multiple such elements, extract them as separate contiguous spans.
* **Do not paraphrase, omit, or reorder** any text.
* **Preserve all tokens exactly** as in the source.
* Use existing natural boundaries such as XML/HTML tags, JSON objects, Markdown headers, list items, or paragraphs.
* Code blocks, tool calls, and similar technical sections must remain whole.
* Maintain the original hierarchy and `type` values.

---

## **Extraction Objective**

Identify and extract spans that each convey a single semantic role.
Think of this as **semantic segmentation for classification**, not text rewriting.
Output exact text spans that can stand alone and be categorized unambiguously.

---

## **Output Format**

Return only one JSON object in this format:

{
  "replacements": [
    {
      "source_part_id": "42",
      "target_parts": [
        {
          "id": "42.1",
          "type": "same_as_source_type",
          "text": "exact text span 1"
        },
        {
          "id": "42.2",
          "type": "same_as_source_type",
          "text": "exact text span 2"
        }
      ]
    },
    {
      "source_part_id": "84",
      "target_parts": [
        {
          "id": "84.1",
          "type": "same_as_source_type",
          "text": "exact text span 1"
        },
        {
          "id": "84.2",
          "type": "same_as_source_type",
          "text": "exact text span 2"
        }
      ]
    }
  ]
}

Each `source_part_id` corresponds to one original message part that was segmented.
Each `target_part` contains one extracted semantic unit, preserving order and meaning.
```
</details>


The next day, I woke up thinking “why is this so difficult, I thought LLMs are good at this stuff”. And then I tried the simplest prompt to test a hypothesis.

```

Given the following text, tell me where all you would apply a break.
```

Woo! The results were instant, and exactly what I wanted. The JSON input was likely interfering with its capability in identifying semantics, so I sent it only the text. And I didn’t need it to do the actual text-splitting, `string.split` could do that. I could also do this in parallel for all the messages that needed to be split. After some more tweaking of instructions, I got to this prompt.

```markdown
Given the following text, tell me where all you would apply a break. The purpose is semantic chunking in way that's suitable for categorization. Only give me the top level sections to split the text into coherent topical chunks.

Return ONLY a valid JSON array of regexes with positive lookahead which I can use to run string split in javascript.

Example response format: ["(?=regex-of-section-1)", "(?=regex-of-section2)"]
```

And without event structured outputs, this worked every time, within a few seconds. No reasoning, and no coding tools.

### Summary

Before:

* **AI:** One prompt to identify large messages, identify semantic chunks, and split up messages accordingly.

After:

* **Engineering:** Identify large messages
* **Engineering:** Create one prompt per message
* **AI:** Identify semantic chunks given plain text, return a JSON array of substrings / regexes
* **Engineering:** Split up messages

## Categorisation

After breaking down messages into smaller chunks, I had to categorise them. So in the same manner, I iterated with my prompt and inputs on ChatGPT until I could find something that worked reasonably well.

Here’s a detailed description of my task, that became a prompt:
<details>
<summary>
<code> Initial Prompt </code>
</summary>

````markdown
**Goal**
Produce a **hierarchical category map** that shows how information is organized in a conversation. Each category aggregates related message parts, summaries, and structure, enabling visualization and navigation of context usage.

**Instruction**
Given a structured conversation where each message part has a unique `message_part_id`, build a JSON tree that groups the conversation into semantically coherent categories and subcategories.

Do **not** use code tools or programmatic parsing for this task. Use reasoning and language understanding only.

### Your task
1. **Identify major categories** – infer the dominant conceptual or functional blocks from the conversation (for example: *Checklist of questions*, *File reads*, *Reasoning*, *Decisions*).
2. **Decompose recursively** – create subcategories only where the material naturally divides into smaller, meaningful topics.
   - Do **not** fix the number of levels; infer depth as needed.
3. **Assign message parts** – tag each message part with exactly one category or subcategory that best represents its content, using its `message_part_id`.
4. **Summarize each category** – every category node, including children, must contain:
   - `id`: unique short identifier, preferably using dot notation to indicate hierarchy (for example: `checklist`, `checklist.data_model`, `analysis.synthesis`)
   - `name`: concise label
   - `summary`: one-sentence description of what this category covers
   - `message_parts`: array of `message_part_id`s assigned directly to this category
   - `children`: nested categories, if any
5. **Preserve domain terminology** – derive category names from the conversation’s subject matter.
6. **Output** – return a structured, machine-readable JSON array representing the hierarchy, ready for downstream parsing and visualization.

---

### Reflection
Before returning the final JSON, perform the following validation steps:

1. **Completeness check** – ensure every `message_part_id` from the input appears in exactly one category.
2. **Representativeness check** – verify that the categories and subcategories together capture the overall structure and intent of the conversation, aligned with the goal.
3. **Domain integrity check** – confirm that terminology and phrasing reflect the conversation’s domain accurately, not abstract generalizations.
4. **Ground-level identification check** – make sure ground-level material (for example: detailed lists, code, or data) is correctly placed in leaf categories.
5. **Empty-category check** – remove or merge any category that has no assigned `message_parts` and no children with assigned parts. Categories without content are not useful.
6. **Final coherence review** – confirm that summaries are accurate, hierarchy depth is sensible, and the map as a whole provides a faithful and navigable representation of the conversation.

---

### Output specification
Return a **JSON array** of top-level categories.

```json
[
  {
    "id": "checklist",
    "name": "Checklist of questions",
    "summary": "User’s structured audit checklist.",
    "message_parts": ["mp_12", "mp_13"],
    "children": [
      {
        "id": "checklist.data_model",
        "name": "Data model checks",
        "summary": "Questions about schema alignment.",
        "message_parts": ["mp_14", "mp_15"]
      },
      {
        "id": "checklist.security",
        "name": "Security and authentication checks",
        "summary": "Questions related to authentication and authorization.",
        "message_parts": ["mp_16"]
      }
    ]
  },
  {
    "id": "analysis.synthesis",
    "name": "Analysis and synthesis",
    "summary": "Assistant’s reasoning and conclusions.",
    "message_parts": ["mp_20", "mp_22"]
  },
  {
    "id": "files.reads",
    "name": "File readings and tool calls",
    "summary": "Assistant’s inspection of repository files using tools.",
    "message_parts": ["mp_30", "mp_31"]
  }
]
````
</details>

What didn’t work? That reflection list in the prompt is a good list of things that failed!

It wouldn’t return all message parts, some parts would remain without a category, some categories would be created without the parts. Sometimes the message part ids would be hallucinated. And of course, all of this took a long time.

Following the same method, I thought about what the model is actually good at, and went with this one-line prompt:

```markdown
given this conversation, give me a list of categories that shows how information is organized. just give me a list of categories in a json array

## Result
[
  "Problem statement and goals",
  "Customer personas and jobs-to-be-done",
  "Functional and data requirements",
  "Technical architecture and stack",
  "Data modeling and schema design",
  "Authentication and security",
  "Directory, person detail, and history",
  "Import and export processes",
  "Analytics and reporting",
  "Audit logging and event tracking",
  "Testing and CI/CD",
  "Performance, scalability, and operations",
  "Open questions and risks",
  "Repository and code organization"
]
```

These weren’t the categories I wanted. I realised didn’t want categories that represented the information in text, I was looking for *components* of the conversation, because with context-viewer, I was not looking to analyse the conversation itself, but *how* the conversation happened. So I changed that one part:

```markdown
given this conversation, give me a list of components it comprises of. just give me a list in a json array

## Result
[
  "product_requirements_document",
  "technical_specification_document",
  "repository_structure",
  "repository_context",
  "task",
  "sources",
  "breakdown",
  "reflection"
]
```

That worked! While no output specification was necessary, I tweaked it a little as I experimented with some more input files.

```markdown
given this conversation, give me a list of all its components
each component can be 3 to 4 words in length

just give me a list in a json array like this example:
["abc_document", "xyz_structure", "foo_context", "task", "sources", "breakdown", "reflection", "files_about_bar", "files_about_baz", "tool_calls_about_quix", "xyz blocks", "pqr list"]
```

And then I used another prompt to get the category mapping for each message part, which worked on the first try.

```markdown
given this conversation and the list of components, give me a mapping of message part ids in the conversation, to a component from the list, for all the message parts

just give me a simple json object {id: component}

<conversation>${conversationJson}</conversation>
<components>${componentsJson}</components>

## Result
{
  "24.5": "product_requirements_document",
  "24.6": "technical_specification_document",
  "24.7": "repository_structure",
  "26": "assistant_reasoning_blocks",
  "27": "assistant_reasoning_blocks",
  "28": "assistant_reasoning_blocks",
  "29": "assistant_reasoning_blocks",
  ...
```

### Summary:

Before:

* AI: A single prompt to identify hierarchical categories, assign categories to message parts, and return the final mapping.

After:

* AI: Identify components
* AI: Assign components to message part ids

  * Engineering: Some basic JSON merging

Overall I’m glad that the prompts I needed in the end were tiny. I think that’s a signal that I’m using LLMs correctly. Just needed to break the problem down, with some good old fashioned engineering.
