import { getWealthsimpleNewsTool } from './get-wealthsimple-news';
import { extractFromXml } from '@extractus/feed-extractor';

jest.mock('@extractus/feed-extractor', () => ({
  extractFromXml: jest.fn(),
}));

describe('getWealthsimpleNewsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return latest TLDR and Magazine articles when both fetches succeed', async () => {
    // Mock TLDR HTML
    const tldrHtml = `
      <a href="https://tldr-archive.wealthsimple.com/archive/33-%F0%9F%87%A8%F0%9F%87%A6-money-qs-we-asked-the-parties-answered">
        <span>🇨🇦 Money Qs? We asked, the parties answered</span>
        <span class="text-tiny">Apr 25, 2025</span>
      </a>
      <a href="https://tldr-archive.wealthsimple.com/archive/33-%F0%9F%87%A8%F0%9F%87%A6-an-8-minute-election-cheat-sheet">
        <span>🇨🇦 An 8-minute election cheat sheet</span>
        <span class="text-tiny">Apr 22, 2025</span>
      </a>
    `;
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(tldrHtml),
      })
    );

    // Mock Magazine RSS
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('<xml></xml>'),
      })
    );
    (extractFromXml as jest.Mock).mockReturnValue({
      entries: [
        {
          title:
            'We Asked Three Party Representatives Our Most Pressing Money Questions',
          description:
            'We spoke to representatives from three federal parties on their plans to grow Canada’s economy and improve affordability. You can read or listen to those chats.',
          link: 'https://www.wealthsimple.com/en-ca/magazine/tldr-interview-landing',
          published: 'Wed, 25 Apr 2125 00:00:00 GMT',
        },
        {
          title: 'Election 2025: Canada Strikes Back?',
          description:
            'Every election, in some respects, is about the economy. But this one is doubly so. We compiled a quick (and, dare we say, fun?) primer on the major candidates’ policies.',
          link: 'https://www.wealthsimple.com/en-ca/magazine/elections-2025-tldr-guide',
          published: 'Mon, 02 Apr 2125 00:00:00 GMT',
        },
      ],
    });

    const result = await getWealthsimpleNewsTool.handler({});
    expect(result).toEqual({
      content: [
        { type: 'text', text: 'Latest TLDR newsletters' },
        {
          type: 'text',
          text: '\n• 🇨🇦 Money Qs? We asked, the parties answered (Apr 25, 2025)\n  https://tldr-archive.wealthsimple.com/archive/33-%F0%9F%87%A8%F0%9F%87%A6-money-qs-we-asked-the-parties-answered',
        },
        {
          type: 'text',
          text: '\n• 🇨🇦 An 8-minute election cheat sheet (Apr 22, 2025)\n  https://tldr-archive.wealthsimple.com/archive/33-%F0%9F%87%A8%F0%9F%87%A6-an-8-minute-election-cheat-sheet',
        },
        { type: 'text', text: 'Latest Wealthsimple Magazine articles' },
        {
          type: 'text',
          text: expect.stringContaining(
            'We Asked Three Party Representatives Our Most Pressing Money Questions'
          ),
        },
        {
          type: 'text',
          text: expect.stringContaining('Election 2025: Canada Strikes Back?'),
        },
      ],
    });
  });

  it('should handle fetches failing', async () => {
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('TLDR fail'))
    );
    (globalThis.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Magazine fail'))
    );

    const result = await getWealthsimpleNewsTool.handler({});
    expect(result.content[0]).toEqual({
      type: 'text',
      text: expect.stringContaining(
        'Error fetching TLDR newsletters: TLDR fail'
      ),
    });
    expect(result.content[1]).toEqual({
      type: 'text',
      text: expect.stringContaining(
        'Error fetching Wealthsimple Magazine articles: Magazine fail'
      ),
    });
  });
});
