import { z } from 'zod';
import { ToolDefinition } from '../../common-types';
import { HelpCentreArticleResponse } from './types';

const getArticleArgsSchema = z.object({
  id: z.number().describe('The ID of the Help Centre article'),
  locale: z.enum(['en-ca', 'fr-ca']).describe('Locale for the article'),
});

const handler = async (args: Record<string, unknown> | undefined) => {
  if (!args) {
    throw new Error('Arguments are required');
  }

  const parsedArgs = getArticleArgsSchema.parse(args);

  try {
    const response = await fetch(
      `https://help.wealthsimple.com/api/v2/help_center/${parsedArgs.locale}/articles/${parsedArgs.id}.json`
    );
    const data = (await response.json()) as HelpCentreArticleResponse;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Article ID: ${data.article.id}\nLocale: ${data.article.locale}\nTitle: ${data.article.title}\n\nBody:\n${data.article.body}`,
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
          text: `Error fetching Help Centre article: ${errorMessage}`,
        },
      ],
    };
  }
};

export const getHelpCentreArticleTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_help_centre_article',
    description:
      'Get a specific Wealthsimple Help Centre article by ID and locale',
    inputSchema: getArticleArgsSchema.shape,
  },
  handler,
};
