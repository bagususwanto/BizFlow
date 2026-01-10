import { defineConfig } from 'vitest/config';
import type { InlineConfig } from 'vitest';

/**
 * Base Vitest configuration
 * Use this for non-React packages (types, database, utils)
 */
export const baseTestConfig: InlineConfig = {
  globals: true,
  environment: 'node',
  include: ['**/*.{test,spec}.{ts,tsx}'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/index.ts',
    ],
  },
  testTimeout: 10000,
  hookTimeout: 10000,
};

export default defineConfig({
  test: baseTestConfig,
});
