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

async function fetchFeed(url: string): Promise<NewsItem[]> {
  const response = await fetch(url);
  const xml = await response.text();
  const feed = extractFromXml(xml);

  return (feed.entries || []).map((entry) => ({
    title: entry.title || '',
    link: entry.link || '',
    pubDate: entry.published || '',
  }));
}

const handler = async (_args: Record<string, unknown> | undefined) => {
  try {
    // Fetch both feeds in parallel
    const [pressReleases, podcasts] = await Promise.all([
      fetchFeed(PRESS_RELEASES_FEED),
      fetchFeed(PODCASTS_FEED),
    ]);

    const response: CompanyNewsResponse = {
      pressReleases,
      podcasts,
    };

    // Format the response for display
    const formatItems = (items: NewsItem[], title: string) => {
      return [
        { type: 'text' as const, text: `\n${title}:` },
        ...items.slice(0, 5).map((item) => ({
          type: 'text' as const,
          text: `\n• ${item.title} (${new Date(item.pubDate).toLocaleDateString()})\n  ${item.link}`,
        })),
      ];
    };

    return {
      content: [
        { type: 'text' as const, text: 'Latest Company News and Podcasts' },
        ...formatItems(response.pressReleases, 'Recent Press Releases'),
        ...formatItems(response.podcasts, 'Latest Podcasts'),
      ],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching company news: ${errorMessage}`,
        },
      ],
    };
  }
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
