import { ToolDefinition } from '../../common-types';
import { extractFromXml } from '@extractus/feed-extractor';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

interface CompanyNewsResponse {
  pressReleases: NewsItem[];
  podcasts: NewsItem[];
}

const PRESS_RELEASES_FEED = 'https://newsroom.wealthsimple.com/feed';
const PODCASTS_FEED = 'https://feeds.simplecast.com/3Tb7al4A';

async function fetchFeed(
  url: string
): Promise<{ items: NewsItem[]; error?: string }> {
  try {
    const response = await fetch(url);
    const xml = await response.text();
    const feed = extractFromXml(xml);

    return {
      items: (feed.entries || []).map((entry) => ({
        title: entry.title || '',
        link: entry.link || '',
        pubDate: entry.published || '',
      })),
    };
  } catch (error: unknown) {
    return {
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

const handler = async (_args: Record<string, unknown> | undefined) => {
  // Fetch both feeds in parallel
  const [pressReleasesResult, podcastsResult] = await Promise.all([
    fetchFeed(PRESS_RELEASES_FEED),
    fetchFeed(PODCASTS_FEED),
  ]);

  const response: CompanyNewsResponse = {
    pressReleases: pressReleasesResult.items,
    podcasts: podcastsResult.items,
  };

  // Format the response for display
  const formatItems = (items: NewsItem[], title: string, error?: string) => {
    const results = [{ type: 'text' as const, text: `\n${title}:` }];

    if (error) {
      results.push({
        type: 'text' as const,
        text: `\n  Error fetching ${title.toLowerCase()}: ${error}`,
      });
    }

    if (items.length > 0) {
      results.push(
        ...items.slice(0, 5).map((item) => ({
          type: 'text' as const,
          text: `\n• ${item.title} (${new Date(item.pubDate).toLocaleDateString()})\n  ${item.link}`,
        }))
      );
    }

    return results;
  };

  const hasErrors = pressReleasesResult.error || podcastsResult.error;

  return {
    content: [
      {
        type: 'text' as const,
        text: hasErrors
          ? 'Company News and Podcasts (with some errors)'
          : 'Latest Company News and Podcasts',
      },
      ...formatItems(
        response.pressReleases,
        'Recent Press Releases',
        pressReleasesResult.error
      ),
      ...formatItems(
        response.podcasts,
        'Latest Podcasts',
        podcastsResult.error
      ),
    ],
  };
};

export const getCompanyNewsTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_company_news',
    description: 'Get the latest Wealthsimple press releases and podcasts',
    // no inputs
    inputSchema: {},
  },
  handler,
};
