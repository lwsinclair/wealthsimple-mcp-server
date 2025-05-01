import { ToolResponse } from '../../common-types';
import { StatusResponse } from './types';

export async function getStatus(): Promise<ToolResponse> {
	try {
		const response = await fetch('https://status.wealthsimple.com/api/v2/status.json');
		const data = await response.json() as StatusResponse;
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
