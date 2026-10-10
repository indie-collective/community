import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);

// The local D1 the tests run against, made fresh when the server starts
// (scripts/reset-local-db.mjs). The specs that read or write it directly
// open it through the same variable.
export const E2E_D1 = '.wrangler/e2e';
process.env.D1_PERSIST_PATH = `${E2E_D1}/v3`;

// End-to-end tests run against a build made and served with
// NODE_ENV=development: the development-only form strategy signs in by email,
// using the accounts scripts/seed.mjs creates, and unlike `react-router dev` a
// build doesn't re-optimise dependencies (and reload pages) mid-run.
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
    command: `node scripts/reset-local-db.mjs ${E2E_D1} && npx react-router build && node --env-file-if-exists=.env node_modules/@react-router/serve/bin.js build/server/index.js`,
    url: `http://localhost:${PORT}/about`,
    env: {
      PORT: String(PORT),
      D1_PERSIST_PATH: `${E2E_D1}/v3`,
      NODE_ENV: 'development',
      // UTC like CI (and most hosts): event times must not depend on the
      // server's time zone (#204).
      TZ: 'UTC',
      // A local catcher (see auth.spec.js) stands in for Discord's webhook.
      DISCORD_NOTIFICATION_WEBHOOK: 'http://127.0.0.1:3199/discord-webhook',
      // A local stand-in for Bluesky's public API (see orgs.spec.js).
      BLUESKY_API: 'http://127.0.0.1:3198',
      // A local stand-in for Twitch and IGDB (see igdb.spec.js).
      TWITCH_OAUTH_API: 'http://127.0.0.1:3197/oauth2',
      IGDB_API: 'http://127.0.0.1:3197/v4',
      IGDB_CLIENT_ID: 'standin',
      IGDB_CLIENT_SECRET: 'standin',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
