import { defineConfig } from 'vitest/config';

// Property tests run 1,000 seeds per generator; under load (parallel runs, slower CI machines)
// some need more than Vitest's 5 s default.
const testTimeout = 30_000;

export default defineConfig({
  test: {
    testTimeout,
    // Listed one by one so each project inherits the timeout (glob projects do not).
    projects: [
      { extends: true, test: { name: '@mfe/core', root: './packages/core' } },
      { extends: true, test: { name: '@mfe/proxy', root: './apps/proxy' } },
      {
        extends: './apps/web/vite.config.ts',
        test: { name: '@mfe/web', root: './apps/web', testTimeout },
      },
      { extends: true, test: { name: 'scripts', root: './scripts' } },
    ],
  },
});
