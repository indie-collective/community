import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);

// The local D1 (and R2) the tests run against, made fresh when the server
// starts (scripts/e2e-server.mjs). The specs that read or write it directly
// open it through the same variable.
export const E2E_D1 = '.wrangler/e2e';
process.env.D1_PERSIST_PATH = `${E2E_D1}/v3`;

// End-to-end tests run against a production build of the Worker, in
// workerd: unlike `react-router dev`, a build doesn't re-optimise
// dependencies (and reload pages) mid-run. DEV_SIGNIN lets them sign in by
// email with the accounts scripts/seed.mjs creates.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node scripts/e2e-server.mjs ${PORT}`,
    url: `http://localhost:${PORT}/about`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
