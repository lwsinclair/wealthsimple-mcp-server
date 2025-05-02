# Wealthsimple MCP Server [![Checks](https://github.com/wealthsimple/wealthsimple-mcp-server/actions/workflows/checks.yml/badge.svg)](https://github.com/wealthsimple/wealthsimple-mcp-server/actions/workflows/checks.yml)

Wealthsimple [Model Context Protocol](https://modelcontextprotocol.io/) server to allow Claude Desktop, Cursor, OpenAI Agents SDK, and other MCP clients to query information about Wealthsimple.

It has **limited** capabilities (for now):

| Tool                                   | Description                                                  |
| -------------------------------------- | ------------------------------------------------------------ |
| `search_wealthsimple_promotions`       | Search through Wealthsimple's ongoing and past promotions    |
| `search_wealthsimple_help_centre`      | Search through Wealthsimple's Help Centre articles           |
| `get_wealthsimple_help_centre_article` | Retrieve a specific Help Centre article by its ID and locale |
| `get_wealthsimple_status`              | Get the current operational status of Wealthsimple services  |
| `get_wealthsimple_tldr_newsletters`    | Get the most recent TLDR newsletters from Wealthsimple       |

<img width="750" alt="Screenshot 2025-05-01 at 18 32 25" src="https://github.com/user-attachments/assets/54f347c9-58e9-446a-ac1f-edb8678654b9" />

## Usage

The MCP server can be run locally or hosted remotely on Cloudflare Workers. It supports [server-sent events](https://modelcontextprotocol.io/docs/concepts/transports#server-sent-events-sse) (SSE) transport.

**Running locally**

Run it locally with `yarn start` and connect at http://localhost:8787/sse.

For example, you can use the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote) by running the command `npx mcp-remote http://localhost:8787/sse` to connect to it through your MCP client.

**Remote hosting**

You can deploy to Cloudflare Workers with `yarn deploy` and connect over SSE at `https://wealthsimple-mcp-server.INSERT-YOUR-ACCOUNT.workers.dev/sse`.

## Connect Claude Desktop

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://wealthsimple-mcp-server.INSERT-YOUR-ACCOUNT.workers.dev/sse" // or http://localhost:8787/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available.
