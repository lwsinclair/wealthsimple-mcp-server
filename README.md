# Wealthsimple MCP Server

Wealthsimple [Model Context Protocol](https://modelcontextprotocol.io/) server with limited capabilities (for now):

| Tool                                   | Description                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `get_wealthsimple_status`              | Get the current operational status of Wealthsimple services                           |
| `search_wealthsimple_help_centre`      | Search through Wealthsimple's Help Centre articles (supports both English and French) |
| `get_wealthsimple_help_centre_article` | Retrieve a specific Help Centre article by its ID and locale                          |
| `get_wealthsimple_tldr_articles`       | Get the most recent TLDR articles from Wealthsimple                                   |
| `get_wealthsimple_podcasts`            | Retrieve the latest Wealthsimple podcast episodes                                     |

## Usage

You can either run it locally with `yarn start`, or if you prefer to host it remotely, you can deploy to Cloudflare Workers with `yarn deploy` and connect over SSE.

## Connect Claude Desktop

You can connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote).

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse" // or https://wealthsimple-mcp-server.INSERT-YOUR-ACCOUNT.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available.
