import { ToolDefinition } from '../../common-types';
import { HelpCentreSearchResponse } from './types';
import { z } from 'zod';

const searchHelpCentreArgsSchema = z.object({
  query: z.string().describe('Search query for Help Centre articles'),
  locale: z
    .enum(['en-ca', 'fr-ca'])
    .default('en-ca')
    .describe('Locale for the search results'),
});

const MAX_RESULTS = 10;

const handler = async (args: Record<string, unknown> | undefined) => {
  if (!args) {
    throw new Error('Arguments are required');
  }

  const parsedArgs = searchHelpCentreArgsSchema.parse(args);

  try {
    const encodedQuery = encodeURIComponent(parsedArgs.query);
    const response = await fetch(
      `https://help.wealthsimple.com/api/v2/help_center/articles/search.json?query=${encodedQuery}&locale=${parsedArgs.locale}`
    );

    // Check if response is ok and content type is JSON
    const contentType = response.headers.get('content-type');
    if (
      !response.ok ||
      !contentType ||
      !contentType.includes('application/json')
    ) {
      throw new Error(
        `Error searching Help Centre: ${response.statusText} (Content type: ${contentType})`
      );
    }

    const data = (await response.json()) as HelpCentreSearchResponse;

    const formattedResults = data.results
      .slice(0, MAX_RESULTS)
      .map((article) => {
        const date = new Date(article.updated_at).toLocaleDateString();
        return `- ${article.title}\n  ID: ${article.id}\n  Locale: ${article.locale}\n  URL: ${article.html_url}\n  Last Updated: ${date}\n`;
      })
      .join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: formattedResults || 'No articles found',
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
          text: `Error searching Help Centre: ${errorMessage}`,
        },
      ],
    };
  }
};

export const searchHelpCentreTool: ToolDefinition = {
  schema: {
    name: 'search_wealthsimple_help_centre',
    description: 'Search Wealthsimple Help Centre articles',
    inputSchema: searchHelpCentreArgsSchema.shape,
  },
  handler,
};
