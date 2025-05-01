# Wealthsimple MCP Server

MCP server for Wealthsimple. Capabilities are still limited, but we're working on it!

## Connect Claude Desktop to your MCP server

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
        "http://localhost:8787/sse"  // or https://wealthsimple-mcp-server.INSERT-YOUR-ACCOUNT.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available.
