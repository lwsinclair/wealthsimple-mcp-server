import { ToolDefinition } from '../../common-types';
import { StatusResponse } from './types';

const handler = async (_args: Record<string, unknown> | undefined) => {
  try {
    const response = await fetch(
      'https://status.wealthsimple.com/api/v2/status.json'
    );
    const data = (await response.json()) as StatusResponse;
    return {
      content: [
        {
          type: 'text' as const,
          text: `Status: ${data.status.description} (Indicator: ${data.status.indicator})`,
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
          text: `Error fetching Wealthsimple status: ${errorMessage}`,
        },
      ],
    };
  }
};

export const getStatusTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_status',
    description: 'Get the status of Wealthsimple',
    // no inputs
    inputSchema: {},
  },
  handler,
};
