import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
    launchOptions: { args: ['--window-size=1920,1080'] },
    baseURL: 'https://gp4.prestaging.us.konnectify.dev/admin/ui/en',
   // baseURL: 'https://gp1.stack1.us.konnectify.dev/admin/ui/en',
    storageState: 'auth.json',  // 👈 loads session for all tests
    // If you run headless and want a “maximized” feel, uncomment:
    // viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'gp6',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,                 // headed so we can truly maximize
      //  launchOptions: { args: ['--start-maximized'] },
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1920, height: 1080 },
        launchOptions: { args: ['--window-size=1920,1080'] },      },
    },
  ],
});
