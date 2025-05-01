import { ZodRawShape } from 'zod';

export interface ToolDefinition {
  schema: {
    name: string;
    description: string;
    inputSchema: ZodRawShape;
  };
  handler: (args: Record<string, unknown> | undefined) => Promise<{
    content: Array<{
      type: 'text'; // only text is supported for now
      text: string;
    }>;
  }>;
}
