import { extractFromXml } from '@extractus/feed-extractor';
import * as cheerio from 'cheerio';
import { ToolDefinition } from '../../common-types';

interface NewsArticle {
  title: string;
  link: string;
  date?: string;
  description?: string;
}

const MAX_ARTICLES = 10;
const TLDR_ARCHIVE_URL = 'https://tldr-archive.wealthsimple.com';
const MAGAZINE_RSS_URL =
  'https://www.wealthsimple.com/rss/wealthsimple-magazine.rss';

async function fetchTldrArticles(): Promise<{
  items: NewsArticle[];
  error?: string;
}> {
  try {
    const response = await fetch(TLDR_ARCHIVE_URL, {
      redirect: 'follow',
    });
    const rawContent = await response.text();
    if (!response.ok) {
      return {
        items: [],
        error: `HTTP ${response.status} ${response.statusText}. Response content: ${rawContent}`,
      };
    }
    try {
      const $ = cheerio.load(rawContent);
      const articles = new Set<string>();
      const items: NewsArticle[] = [];
      $('a[href^="https://tldr-archive.wealthsimple.com/archive/"]').each(
        (_: any, element: any) => {
          const link = $(element).attr('href');
          if (!link || articles.has(link)) {
            return;
          }
          const title = $(element).find('span').first().text().trim();
          const date = $(element).find('span.text-tiny').text().trim();
          if (title && date && link) {
            articles.add(link);
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
    return {
      items: [],
      error:
        fetchError instanceof Error
          ? fetchError.message
          : 'Archive fetch failed',
    };
  }
}

async function fetchMagazineArticles(): Promise<{
  items: NewsArticle[];
  error?: string;
}> {
  try {
    const response = await fetch(MAGAZINE_RSS_URL);
    const xml = await response.text();
    if (!response.ok) {
      return {
        items: [],
        error: `HTTP ${response.status} ${response.statusText}. Response content: ${xml}`,
      };
    }
    const feed = extractFromXml(xml);
    const items: NewsArticle[] = (feed.entries || []).map((entry) => ({
      title: entry.title || '',
      link: entry.link || '',
      // Date seems to be incorrect in the RSS feed, so we're not using it
      // date: entry.published || '',
      description: entry.description || '',
    }));
    return { items };
  } catch (fetchError: unknown) {
    return {
      items: [],
      error:
        fetchError instanceof Error
          ? fetchError.message
          : 'Magazine RSS fetch failed',
    };
  }
}

const handler = async (_args: Record<string, unknown> | undefined) => {
  const [tldrResult, magazineResult] = await Promise.all([
    fetchTldrArticles(),
    fetchMagazineArticles(),
  ]);

  const formatItems = (items: NewsArticle[]) =>
    items.slice(0, MAX_ARTICLES).map((item) => ({
      type: 'text' as const,
      text:
        `\n• ${item.title}${item.date ? ` (${item.date})` : ''}\n  ${item.link}` +
        (item.description ? `\n  ${item.description}` : ''),
    }));

  const content = [];

  if (tldrResult.error) {
    content.push({
      type: 'text' as const,
      text: `Error fetching TLDR newsletters: ${tldrResult.error}`,
    });
  } else {
    content.push({ type: 'text' as const, text: 'Latest TLDR newsletters' });
    content.push(...formatItems(tldrResult.items));
  }

  if (magazineResult.error) {
    content.push({
      type: 'text' as const,
      text: `Error fetching Wealthsimple Magazine articles: ${magazineResult.error}`,
    });
  } else {
    content.push({
      type: 'text' as const,
      text: 'Latest Wealthsimple Magazine articles',
    });
    content.push(...formatItems(magazineResult.items));
  }

  return { content };
};

export const getWealthsimpleNewsTool: ToolDefinition = {
  schema: {
    name: 'get_wealthsimple_news',
    description:
      'Get the latest Wealthsimple TLDR newsletters and Wealthsimple Magazine articles',
    inputSchema: {},
  },
  handler,
};
