import { ToolDefinition } from '../../common-types';
import { IncidentsResponse } from './types';

const MAX_INCIDENTS = 20;

const handler = async (_args: Record<string, unknown> | undefined) => {
  try {
    const response = await fetch(
      'https://status.wealthsimple.com/api/v2/incidents.json'
    );
    const data = (await response.json()) as IncidentsResponse;

    const formattedIncidents = data.incidents
      .slice(0, MAX_INCIDENTS)
      .map((incident) => {
        const date = new Date(incident.created_at).toLocaleDateString();
        const resolvedDate = incident.resolved_at
          ? new Date(incident.resolved_at).toLocaleDateString()
          : 'Ongoing';

        return `- ${incident.name}\n  Status: ${incident.status}\n  Impact: ${incident.impact}\n  Created: ${date}\n  Resolved: ${resolvedDate}\n`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: formattedIncidents || 'No recent incidents',
        },
      ],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching Wealthsimple incidents: ${errorMessage}`,
        },
      ],
    };
  }
};

export const getIncidentsHistoryTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_incidents_history',
    description: 'Get the history of incidents for Wealthsimple',
    // no inputs
    inputSchema: {},
  },
  handler,
};
