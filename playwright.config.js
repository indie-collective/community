import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);

// End-to-end tests run against a build made and served with
// NODE_ENV=development: the development-only form strategy signs in by email,
// using the accounts prisma/seed.js creates, and unlike `react-router dev` a
// build doesn't re-optimise dependencies (and reload pages) mid-run.
// DATABASE_URL must point at a database migrated and seeded for the run.
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
    command:
      'npx react-router build && node node_modules/@react-router/serve/bin.js build/server/index.js',
    url: `http://localhost:${PORT}/about`,
    env: {
      PORT: String(PORT),
      NODE_ENV: 'development',
      // UTC like CI (and most hosts): event times must not depend on the
      // server's time zone (#204).
      TZ: 'UTC',
      // A local catcher (see auth.spec.js) stands in for Discord's webhook.
      DISCORD_NOTIFICATION_WEBHOOK: 'http://127.0.0.1:3199/discord-webhook',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
