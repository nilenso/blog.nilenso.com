---
title: MCP explained without hype or fluff
kind: article
author: Atharva Raykar
created_at: 2025-05-12 00:00:00 UTC
layout: post
---
Model Context Protocol, like most protocols, solves the M ⨯ N integration problem by turning it into an M + N integration problem.

An AI client application that speaks this protocol does not have to figure out how to fetch data or take actions specific to a platform.

MCP may not make your AI smarter, or improve your product, but it will reduce the friction to integrate against other applications that already support MCP. This may or may not be important to you.

The protocol specifies MCP Servers, that generally connect to data sources and expose tools specific to it. Then there are MCP clients, which are a part of AI applications. They can connect to any MCP Server, typically through a configuration that specifies how to connect to or run the server.

The Servers, more commonly implemented than Clients, may expose:
* **Tools** that the LLM can call, eg, `fetch_file` for a filesystem or `send_mail` for a mail client integration.
* **Prompts**, which are reusable templates of instructions or multi-step conversations for the LLM, that are intended to be user-controlled.
* **Resources** that are exposed via URIs; it's up to the client application's design to decide how these are fetched or used.
* **Sampling** lets the server borrow the LLM on the MCP client, which can be especially useful for agentic patterns that need the client context.

There are a few more functions and nuances to Servers, but these are what broadly stood out to me. Most Servers that I have seen or used mostly just expose tool calls.

## A tiny concrete example: an MCP for Open Data access

I wrote a tiny MCP server to expose actions to take on CKAN, an open source data management system that's used by Governments and other organisations to publish open datasets. It has a web interface that links to these tagged datasets, which are usually semi-structured (CSVs, XLS) or entirely unstructured (PDF reports and papers).

(image of the UI)

This is not particularly conducive to discovery and drilling through data. It's also significant friction to connect dots across datasets.

 

* How I wrote this
* Brief explanation of the code
* How this MCP theoretically helps
* What writing this MCP does not help with

## Should I build an MCP?
* Reemphasise properties of MCPs
* A lot of usefulness and capabilities exist on the client
* MCP is a clear concrete thing to do, but it doesn't make a good product. It's another tool in your toolbox.

## Details about the protocol (should this be in the appendix?)

## References, for a deeper dive
