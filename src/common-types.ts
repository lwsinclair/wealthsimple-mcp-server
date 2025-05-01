import { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface ToolDefinition {
  schema: Tool;
  handler: (args: Record<string, unknown> | undefined) => Promise<{
    content: Array<{
      type: 'text'; // only text is supported for now
      text: string;
    }>;
  }>;
}
