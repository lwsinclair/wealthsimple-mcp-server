import { ToolDefinition } from '../../common-types';
import { extractFromXml } from '@extractus/feed-extractor';

interface PodcastItem {
  title: string;
  link: string;
  pubDate: string;
}

const PODCASTS_FEED = 'https://feeds.simplecast.com/3Tb7al4A';

async function fetchPodcastFeed(): Promise<{
  items: PodcastItem[];
  error?: string;
}> {
  try {
    const response = await fetch(PODCASTS_FEED, {
      // Follow redirects
      redirect: 'follow',
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
      const feed = extractFromXml(rawContent);

      return {
        items: (feed.entries || []).map((entry) => ({
          title: entry.title || '',
          link: entry.link || '',
          pubDate: entry.published || '',
        })),
      };
    } catch (parseError: unknown) {
      // Include the raw content in parsing errors to help debug
      const errorMessage =
        parseError instanceof Error
          ? parseError.message
          : 'Feed parsing failed';
      return {
        items: [],
        error: `Feed parsing error: ${errorMessage}. Raw content: ${rawContent}`,
      };
    }
  } catch (fetchError: unknown) {
    console.error('Feed fetch error:', fetchError);
    return {
      items: [],
      error:
        fetchError instanceof Error ? fetchError.message : 'Feed fetch failed',
    };
  }
}

const handler = async (_args: Record<string, unknown> | undefined) => {
  const podcastsResult = await fetchPodcastFeed();

  // Format the response for display
  const formatItems = (items: PodcastItem[]) => {
    return items.slice(0, 5).map((item) => ({
      type: 'text' as const,
      text: `\n• ${item.title} (${new Date(item.pubDate).toLocaleDateString()})\n  ${item.link}`,
    }));
  };

  if (podcastsResult.error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error fetching podcasts: ${podcastsResult.error}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: 'Latest Podcasts',
      },
      ...formatItems(podcastsResult.items),
    ],
  };
};

export const getPodcastsTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_podcasts',
    description: 'Get the latest Wealthsimple podcasts',
    // no inputs
    inputSchema: {},
  },
  handler,
};
