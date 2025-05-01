import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

interface WealthsimpleStatusResponse {
	page: {
		id: string;
		name: string;
		url: string;
		time_zone: string;
		updated_at: string;
	};
	status: {
		indicator: string;
		description: string;
	};
}

interface WealthsimpleIncident {
	name: string;
	status: string;
	created_at: string;
	resolved_at: string | null;
	impact: string;
}

interface WealthsimpleIncidentsResponse {
	page: {
		id: string;
		name: string;
		url: string;
		time_zone: string;
		updated_at: string;
	};
	incidents: Array<WealthsimpleIncident>;
}

// Define our MCP agent with tools
export class WealthsimpleMCP extends McpAgent {
	server = new McpServer({
		name: "Wealthsimple MCP",
		version: "1.0.0",
	});

	async init() {
		// Wealthsimple status check tool
		this.server.tool(
			"get_wealthsimple_status",
			{},
			async () => {
				try {
					const response = await fetch('https://status.wealthsimple.com/api/v2/status.json');
					const data = await response.json() as WealthsimpleStatusResponse;
					return {
						content: [{
							type: "text",
							text: `Status: ${data.status.description} (Indicator: ${data.status.indicator})`
						}]
					};
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
					return {
						content: [{
							type: "text",
							text: `Error fetching Wealthsimple status: ${errorMessage}`
						}]
					};
				}
			}
		);

		// Wealthsimple incidents tool
		this.server.tool(
			"get_wealthsimple_incidents",
			{},
			async () => {
				try {
					const response = await fetch('https://status.wealthsimple.com/api/v2/incidents.json');
					const data = await response.json() as WealthsimpleIncidentsResponse;

					const formattedIncidents = data.incidents.map(incident => {
						const date = new Date(incident.created_at).toLocaleDateString();
						const resolvedDate = incident.resolved_at
							? new Date(incident.resolved_at).toLocaleDateString()
							: 'Ongoing';

						return `- ${incident.name}\n  Status: ${incident.status}\n  Impact: ${incident.impact}\n  Created: ${date}\n  Resolved: ${resolvedDate}\n`;
					}).join('\n');

					return {
						content: [{
							type: "text",
							text: formattedIncidents || 'No recent incidents'
						}]
					};
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
					return {
						content: [{
							type: "text",
							text: `Error fetching Wealthsimple incidents: ${errorMessage}`
						}]
					};
				}
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			// @ts-ignore
			return WealthsimpleMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			// @ts-ignore
			return WealthsimpleMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
