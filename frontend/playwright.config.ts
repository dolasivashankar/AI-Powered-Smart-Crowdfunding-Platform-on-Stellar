import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const previewPort = 4173;
const devPort = 5173;

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      (isCI ? `http://localhost:${previewPort}` : `http://localhost:${devPort}`),
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: isCI ? 'npm run preview' : 'npm run dev',
    url: isCI
      ? `http://localhost:${previewPort}`
      : `http://localhost:${devPort}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
