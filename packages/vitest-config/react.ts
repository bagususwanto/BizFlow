import { defineConfig } from 'vitest/config';
import { baseTestConfig } from './base';

/**
 * React Vitest configuration
 * Use this for React packages (ui, web)
 */
export default defineConfig({
  test: {
    ...baseTestConfig,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
});
