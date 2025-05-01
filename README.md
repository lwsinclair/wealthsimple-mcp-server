# Wealthsimple MCP Server

Wealthsimple [Model Context Protocol](https://modelcontextprotocol.io/) server with limited capabilities (for now):

- Search Wealthsimple help centre articles
- Get Wealthsimple company updates (current status, recent TLDR articles, recent podcasts)

Run it locally with `yarn start`, or deploy to Cloudflare Workers with `yarn deploy`.

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
