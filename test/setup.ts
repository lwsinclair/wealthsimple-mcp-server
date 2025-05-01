import { jest } from '@jest/globals';

// Setup fetch mock for all tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
