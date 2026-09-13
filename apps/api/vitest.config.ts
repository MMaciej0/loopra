import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';
import { TEST_WORKERS } from './test/helpers/databases.js';

// does not override what is already set, so running inside the api container
// keeps the values docker compose injects
config({ path: fileURLToPath(new URL('.env.test', import.meta.url)), quiet: true });

export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup.ts'],
    setupFiles: ['./test/worker-setup.ts'],
    // forks, not threads: each worker rewrites process.env.DATABASE_URL to its own
    // database, and threads would share a single env object
    pool: 'forks',
    maxWorkers: TEST_WORKERS,
    testTimeout: 15000,
  },
});
