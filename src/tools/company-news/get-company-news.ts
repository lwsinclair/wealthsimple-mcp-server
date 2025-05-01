import { ToolDefinition } from '../../common-types';
import Parser from 'rss-parser';

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

const handler = async (_args: Record<string, unknown> | undefined) => {
  try {
    const parser = new Parser();

    // Fetch both feeds in parallel
    const [pressReleasesFeed, podcastsFeed] = await Promise.all([
      parser.parseURL(PRESS_RELEASES_FEED),
      parser.parseURL(PODCASTS_FEED),
    ]);

    const response: CompanyNewsResponse = {
      pressReleases: pressReleasesFeed.items.map((item) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
      })),
      podcasts: podcastsFeed.items.map((item) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
      })),
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
