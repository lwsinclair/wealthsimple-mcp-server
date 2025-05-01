import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getStatus } from './tools/status/get-status';
import { getIncidentsHistory } from './tools/status/get-incidents-history';

// Define our MCP agent with tools
export class WealthsimpleMCP extends McpAgent {
  server = new McpServer({
    name: 'Wealthsimple MCP',
    version: '1.0.0',
  });

  async init() {
    // Wealthsimple status check tool
    this.server.tool('get_wealthsimple_status', {}, async () => getStatus());

    // Wealthsimple incidents tool
    this.server.tool('get_wealthsimple_incidents_history', {}, async () =>
      getIncidentsHistory()
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return WealthsimpleMCP.serveSSE('/sse').fetch(request, env, ctx);
    }

    if (url.pathname === '/mcp') {
      return WealthsimpleMCP.serve('/mcp').fetch(request, env, ctx);
    }

    return new Response('Not found', { status: 404 });
  },
};
