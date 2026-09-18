import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  // Default: node, for service and pure-logic tests. Component tests opt into
  // jsdom with a `@jest-environment jsdom` docblock.
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/app/**/layout.tsx',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
  ],
};

export default createJestConfig(config);
