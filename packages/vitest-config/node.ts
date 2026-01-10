import { defineConfig } from 'vitest/config';
import { baseTestConfig } from './base';

/**
 * Node.js Vitest configuration
 * Use this for backend packages (api, database)
 */
export default defineConfig({
  test: {
    ...baseTestConfig,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
