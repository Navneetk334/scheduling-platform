import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

/**
 * Playwright configuration for end-to-end tests. Starts the production web
 * build and runs specs from `e2e/`. API-dependent flows require the API +
 * infrastructure to be running (see docker-compose).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
