import { searchHelpCentreTool, searchPromotionsTool } from './search';
import { HELP_CENTRE_HOSTNAMES } from './constants';

describe('Help Centre Search Tools', () => {
  const fetchSpy = jest.spyOn(global, 'fetch');

  beforeEach(() => {
    fetchSpy.mockClear();
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  const mockSearchResponse = {
    results: [
      {
        id: 123,
        title: 'Test Article',
        locale: 'en-ca',
        html_url: 'https://test.com/article',
        snippet: 'This is a test snippet',
        updated_at: '2024-03-20T12:00:00Z',
      },
    ],
  };

  const createMockResponse = () => {
    return new Response(JSON.stringify(mockSearchResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  describe('searchHelpCentreTool', () => {
    it('successfully searches help centre articles', async () => {
      // Setup mock response
      fetchSpy.mockResolvedValueOnce(createMockResponse());

      const result = await searchHelpCentreTool.handler({
        query: 'test query',
        locale: 'en-ca',
      });

      // Verify fetch was called with correct URL
      expect(fetchSpy).toHaveBeenCalledWith(
        `https://${HELP_CENTRE_HOSTNAMES.help}/api/v2/help_center/articles/search.json?query=test%20query&locale=en-ca`
      );

      // Verify response format
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test Article');
      expect(result.content[0].text).toContain('ID: 123');
      expect(result.content[0].text).toContain('This is a test snippet');
    });
  });

  describe('searchPromotionsTool', () => {
    it('successfully searches promotions articles', async () => {
      // Setup mock response
      fetchSpy.mockResolvedValueOnce(createMockResponse());

      const result = await searchPromotionsTool.handler({
        query: 'promotion query',
        locale: 'en-ca',
      });

      // Verify fetch was called with correct URL
      expect(fetchSpy).toHaveBeenCalledWith(
        `https://${HELP_CENTRE_HOSTNAMES.promotions}/api/v2/help_center/articles/search.json?query=promotion%20query&locale=en-ca`
      );

      // Verify response format
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test Article');
      expect(result.content[0].text).toContain('ID: 123');
      expect(result.content[0].text).toContain('This is a test snippet');
    });
  });
});
