import { ToolResponse } from '../../common-types';
import { IncidentsResponse } from './types';

export async function getIncidentsHistory(): Promise<ToolResponse> {
	try {
		const response = await fetch('https://status.wealthsimple.com/api/v2/incidents.json');
		const data = await response.json() as IncidentsResponse;

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
