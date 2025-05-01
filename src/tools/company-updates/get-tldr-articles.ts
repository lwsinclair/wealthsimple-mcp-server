import { ToolDefinition } from '../../common-types';
import * as cheerio from 'cheerio';

interface TldrArticle {
  title: string;
  link: string;
  date: string;
}

const MAX_ARTICLES = 10;
const TLDR_ARCHIVE_URL = 'https://tldr-archive.wealthsimple.com';

async function fetchTldrArticles(): Promise<{
  items: TldrArticle[];
  error?: string;
}> {
  try {
    const response = await fetch(TLDR_ARCHIVE_URL, {
      redirect: 'follow', // Follow redirects
    });
    const rawContent = await response.text();

    // If response is not ok, return the full response content for debugging
    if (!response.ok) {
      return {
        items: [],
        error: `HTTP ${response.status} ${response.statusText}. Response content: ${rawContent}`,
      };
    }

    try {
      const $ = cheerio.load(rawContent);
      const articles = new Set<string>(); // To track duplicates by URL
      const items: TldrArticle[] = [];

      // Find all article links
      $('a[href^="https://tldr-archive.wealthsimple.com/archive/"]').each(
        (_: any, element: any) => {
          const link = $(element).attr('href');
          if (!link || articles.has(link)) {
            return; // Skip if no link or duplicate
          }

          const title = $(element).find('span').first().text().trim();
          const date = $(element).find('span.text-tiny').text().trim();

          if (title && date && link) {
            articles.add(link); // Track this URL
            items.push({
              title,
              link,
              date,
            });
          }
        }
      );

      return { items };
    } catch (parseError: unknown) {
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : 'HTML parsing failed';
      return {
        items: [],
        error: `HTML parsing error: ${errorMessage}. Raw content: ${rawContent}`,
      };
    }
  } catch (fetchError: unknown) {
    console.error('TLDR archive fetch error:', fetchError);
    return {
      items: [],
      error:
        fetchError instanceof Error
          ? fetchError.message
          : 'Archive fetch failed',
    };
  }
}

const handler = async (_args: Record<string, unknown> | undefined) => {
  const tldrResult = await fetchTldrArticles();

  // Format the response for display
  const formatItems = (items: TldrArticle[]) => {
    return items.slice(0, MAX_ARTICLES).map((item) => ({
      type: 'text' as const,
      text: `\n• ${item.title} (${item.date})\n  ${item.link}`,
    }));
  };

  if (tldrResult.error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching TLDR articles: ${tldrResult.error}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: 'Latest TLDR Articles',
      },
      ...formatItems(tldrResult.items),
    ],
  };
};

export const getTldrArticlesTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_tldr_articles',
    description: 'Get the latest Wealthsimple TLDR articles',
    // no inputs
    inputSchema: {},
  },
  handler,
};
