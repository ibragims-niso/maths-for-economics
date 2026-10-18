import { defineConfig, devices } from '@playwright/test';

/**
 * Key flows in a real browser (docs/08 Phase 2), against the production build with its service
 * worker. Run with `npm run test:e2e` (builds first). Locally it uses the installed Edge; in CI
 * the Chromium that Playwright downloads.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Pixel 7'],
    baseURL: 'http://localhost:4180',
    ...(process.env.CI ? {} : { channel: 'msedge' }),
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite preview --port 4180 --strictPort',
    url: 'http://localhost:4180',
    reuseExistingServer: !process.env.CI,
  },
});
