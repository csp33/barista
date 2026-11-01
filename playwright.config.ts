import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile (iPhone 13)',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'Mobile (Pixel 7)',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'Mobile Small (320px)',
      use: {
        viewport: { width: 320, height: 568 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60 * 1000,
  },
});
