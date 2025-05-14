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

## A tiny concrete example: an MCP server for Open Data access

I wrote a tiny MCP server to expose actions to take on CKAN, an open source data management system that's used by Governments and other organisations to publish open datasets. CKAN has a web interface that links to these tagged datasets, which are usually semi-structured (CSVs, XLS) or totally unstructured (PDF reports and papers).

(image of the UI)

This is not particularly conducive to discovery and drilling through data. It's also significant friction to connect dots across datasets. I thought it would be nice to have an AI application that can access all the datasets on CKAN and make sense of it. Open Data is as useful as the insights that can be extracted from it.

One way for me to have approached this is to write an AI application from scratch encoded with knowledge about all the CKAN REST APIs. Unfortunately, this would have "locked in" AI use of CKAN open data sets to just my application. And [data, especially Open Data wants to be free](https://en.wikipedia.org/wiki/Information_wants_to_be_free).

What I really wanted is a well-known "doorknob" that a lot of AI applications and agents in the world would know how to open. This is what MCP servers do. I wrote one in a couple of hours.

I used the official MCP Python SDK and defined some tools. Here's an excerpt of what that looks like:

```python
@mcp.tool()
async def list_tags(query: Optional[str] = None, limit: int = 50, ctx: Context = None) -> str:
    """List available tags in CKAN.

    Args:
        query: Optional search string to filter tags
        limit: Maximum number of tags to return

    Returns:
        A formatted string containing available tags.
    """
    # code to list all the tags used to tag data, via the CKAN API

@mcp.tool()
async def search_datasets(
    query: Optional[str] = None,
    tags: Optional[List[str]] = None,
    organization: Optional[str] = None,
    format: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    ctx: Context = None
) -> str:
    """Search for datasets with various filters.

    Args:
        query: Free text search query
        tags: Filter by tags (list of tag names)
        organization: Filter by organization name
        format: Filter by resource format (e.g., CSV, JSON)
        limit: Maximum number of datasets to return
        offset: Number of datasets to skip

    Returns:
        A formatted string containing matching datasets.
    """
    # code to handle searches, using the CKAN API

@mcp.tool()
async def get_resource_details(resource_id: str, ctx: Context = None) -> str:
    """Get detailed information about a specific resource (file/data).

    Args:
        resource_id: The ID of the resource

    Returns:
        A formatted string containing resource details.
    """
    # code to read the details and get the link to a specific resource, using the CKAN API
```

The details of the SDK are better explained in official guides, but the gist of it is that it is an abstraction over JSON-RPC request-response messages that are defined in the protocol. The server I have implemented runs locally, launched as a subprocess by the client app and uses the stdio streams to pass these protocol messages around. Remote MCP servers are a thing as well.

After wrote this server, I exposed it to the Claude desktop app, which is also an MCP client by editing `claude_desktop_config.json`. I pointed it to justicehub.in, a CKAN instance that contains legal and justice data, created by the folks at CivicDataLabs.

```json
{
  "mcpServers": {
    "CKAN Server": {
      "command": "/Users/atharva/.local/bin/uv",
      "args": [
        "run",
        "--with",
        "httpx",
        "--with",
        "mcp[cli]",
        "mcp",
        "run",
        "/Users/atharva/ckan-mcp-server/main.py"
      ],
      "env": {
        "CKAN_URL": "https://justicehub.in"
      }
    }
  }
}
```

This allowed me to use this data through Claude.



## Should I build an MCP?
* Reemphasise properties of MCPs
* A lot of usefulness and capabilities exist on the client
* MCP is a clear concrete thing to do, but it doesn't make a good product. It's another tool in your toolbox.

## Details about the protocol (should this be in the appendix?)

## References, for a deeper dive
