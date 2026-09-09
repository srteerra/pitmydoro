import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.NEXT_PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? '50%' : '75%',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    testIdAttribute: 'data-pw-id',
  },
  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
        { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
      ],
  webServer: {
    command: isCI
      ? 'pnpm run start'
      : process.env.PW_DEV_SERVER
        ? 'pnpm run dev'
        : 'pnpm run build && pnpm run start',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
