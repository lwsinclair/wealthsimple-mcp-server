import { getHelpCentreArticleTool } from './get-article';
import { HELP_CENTRE_HOSTNAMES } from './constants';

describe('getHelpCentreArticleTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return an article successfully', async () => {
    const mockArticle = {
      article: {
        id: 123,
        locale: 'en-ca',
        title: 'Test Article',
        body: 'Test article body content',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockArticle),
    });

    const result = await getHelpCentreArticleTool.handler({
      id: 123,
      locale: 'en-ca',
      helpCentreType: 'help',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `https://${HELP_CENTRE_HOSTNAMES.help}/api/v2/help_center/en-ca/articles/123.json`
    );

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Article ID: 123\nLocale: en-ca\nTitle: Test Article\n\nBody:\nTest article body content`,
        },
      ],
    });
  });

  it('should handle fetch errors gracefully', async () => {
    const errorMessage = 'Network error';
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const result = await getHelpCentreArticleTool.handler({
      id: 123,
      locale: 'en-ca',
      helpCentreType: 'help',
    });

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Error fetching article: ${errorMessage}`,
        },
      ],
    });
  });

  it('should throw error when no arguments are provided', async () => {
    await expect(getHelpCentreArticleTool.handler(undefined)).rejects.toThrow(
      'Arguments are required'
    );
  });

  it('should validate input arguments', async () => {
    await expect(
      getHelpCentreArticleTool.handler({
        id: 'invalid', // should be a number
        locale: 'en-ca',
        helpCentreType: 'help',
      })
    ).rejects.toThrow();
  });
});
