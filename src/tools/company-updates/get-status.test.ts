import { getStatusTool } from './get-status';
import { StatusResponse } from './types';

describe('getStatusTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return operational status when API call is successful', async () => {
    const mockResponse: StatusResponse = {
      page: {
        id: 'test-page',
        name: 'Test Page',
        url: 'https://status.wealthsimple.com',
        time_zone: 'UTC',
        updated_at: '2024-03-21T00:00:00.000Z',
      },
      status: {
        description: 'All Systems Operational',
        indicator: 'none',
      },
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await getStatusTool.handler({});

    expect(fetch).toHaveBeenCalledWith(
      'https://status.wealthsimple.com/api/v2/status.json'
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Status: All Systems Operational (Indicator: none)',
        },
      ],
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Network error');
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      mockError
    );

    const result = await getStatusTool.handler({});

    expect(fetch).toHaveBeenCalledWith(
      'https://status.wealthsimple.com/api/v2/status.json'
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Error fetching Wealthsimple status: Network error',
        },
      ],
    });
  });

  it('should handle unknown errors gracefully', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      'Unknown error'
    );

    const result = await getStatusTool.handler({});

    expect(fetch).toHaveBeenCalledWith(
      'https://status.wealthsimple.com/api/v2/status.json'
    );
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Error fetching Wealthsimple status: Unknown error occurred',
        },
      ],
    });
  });
});
