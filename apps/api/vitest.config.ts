import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.ts'],
    pool: 'forks',
    fileParallelism: false,
    testTimeout: 15000,
  },
});
