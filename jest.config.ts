import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  // globalSetup: '<rootDir>/scripts/global-setup.ts',
  // setupFilesAfterEnv: ['<rootDir>/jest/setup-after-env.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/test/setup.ts'],
  testTimeout: 5000,
  modulePathIgnorePatterns: ['<rootDir>/build'],
  // Ignore console.log statements in CI:
  silent: process.env.CI === 'true',
};

export default config;
