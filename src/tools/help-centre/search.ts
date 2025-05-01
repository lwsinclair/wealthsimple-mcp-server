import { ToolDefinition } from '../../common-types';
import { HelpCentreSearchResponse } from './types';
import { HELP_CENTRE_HOSTNAMES } from './constants';
import { z } from 'zod';

const searchHelpCentreArgsSchema = z.object({
  query: z
    .string()
    .describe(
      'Search query. The query should be concise as it is keyword based and does not support natural language search well. For example: "What is the minimum balance for a TFSA?" = BAD, "TFSA minimum balance" = GOOD. Leave out redundant words like "wealthsimple" since it is implied.'
    ),
  locale: z
    .enum(['en-ca', 'fr-ca'])
    .default('en-ca')
    .describe('Locale for the search results'),
});

const MAX_RESULTS = 15;

const searchHandler = async (
  args: Record<string, unknown> | undefined,
  hostname: string
) => {
  if (!args) {
    throw new Error('Arguments are required');
  }

  const parsedArgs = searchHelpCentreArgsSchema.parse(args);

  try {
    const encodedQuery = encodeURIComponent(parsedArgs.query);
    const response = await fetch(
      `https://${hostname}/api/v2/help_center/articles/search.json?query=${encodedQuery}&locale=${parsedArgs.locale}`
    );

    // Check if response is ok and content type is JSON
    const contentType = response.headers.get('content-type');
    if (
      !response.ok ||
      !contentType ||
      !contentType.includes('application/json')
    ) {
      throw new Error(`Error searching articles: ${response.statusText}`);
    }

    const data = (await response.json()) as HelpCentreSearchResponse;

    const formattedResults = data.results
      .slice(0, MAX_RESULTS)
      .map((article) => {
        const date = new Date(article.updated_at).toLocaleDateString();
        return `- ${article.title}\n  ID: ${article.id}\n  Locale: ${article.locale}\n  URL: ${article.html_url}\n  Snippet: ${article.snippet ?? 'No snippet available'}\n  Last Updated: ${date}\n`;
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
          text: `Error searching articles: ${errorMessage}`,
        },
      ],
    };
  }
};

export const searchHelpCentreTool: ToolDefinition = {
  schema: {
    name: 'search_wealthsimple_help_centre',
    description: 'Search Wealthsimple Help Centre articles by query',
    inputSchema: searchHelpCentreArgsSchema.shape,
  },
  handler: (args) => searchHandler(args, HELP_CENTRE_HOSTNAMES.help),
};

export const searchPromotionsTool: ToolDefinition = {
  schema: {
    name: 'search_wealthsimple_promotions',
    description:
      'Search Wealthsimple Promotions articles by query. Use this for questions about current or past promotions, referral programs, and special offers.',
    inputSchema: searchHelpCentreArgsSchema.shape,
  },
  handler: (args) => searchHandler(args, HELP_CENTRE_HOSTNAMES.promotions),
};
