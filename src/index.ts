import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getStatusTool } from './tools/company-updates/get-status';
import { getPodcastsTool } from './tools/company-updates/get-podcasts';
import { getTldrArticlesTool } from './tools/company-updates/get-tldr-articles';
import {
  searchHelpCentreTool,
  searchPromotionsTool,
} from './tools/help-centre/search';
import { getHelpCentreArticleTool } from './tools/help-centre/get-article';

const tools = [
  getStatusTool,
  getPodcastsTool,
  getTldrArticlesTool,
  searchHelpCentreTool,
  searchPromotionsTool,
  getHelpCentreArticleTool,
];

export class WealthsimpleMCP extends McpAgent {
  server = new McpServer({
    name: 'Wealthsimple MCP',
    version: '1.0.0',
  });

  async init() {
    tools.forEach((tool) => {
      this.server.tool(
        tool.schema.name,
        tool.schema.description,
        tool.schema.inputSchema,
        tool.handler
      );
    });
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === '/sse' || url.pathname === '/sse/message') {
      return WealthsimpleMCP.serveSSE('/sse').fetch(
        request,
        // @ts-ignore
        env,
        ctx
      );
    }

    if (url.pathname === '/mcp') {
      return WealthsimpleMCP.serve('/mcp').fetch(
        request,
        // @ts-ignore
        env,
        ctx
      );
    }

    return new Response('Not found', { status: 404 });
  },
};
