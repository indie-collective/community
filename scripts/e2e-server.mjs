#!/usr/bin/env node
/**
 * The server the end-to-end tests run against (see playwright.config.js):
 * a fresh local D1 and R2 in `.wrangler/e2e`, a production build, and the
 * Worker served by `vite preview` in workerd, with the variables below in
 * place of `.env` / `.dev.vars`.
 *
 * Usage: node scripts/e2e-server.mjs <port>
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';

const port = process.argv[2] ?? '3100';
const state = '.wrangler/e2e';

const vars = {
  SESSION_SECRET: 'e2e-only-session-secret',
  // Sign in by email alone, with the accounts scripts/seed.mjs creates.
  DEV_SIGNIN: 'true',
  // Never used: the tests sign in by email.
  DISCORD_CLIENT_ID: 'e2e',
  DISCORD_CLIENT_SECRET: 'e2e',
  // A local catcher (see auth.spec.js) stands in for Discord's webhook.
  DISCORD_NOTIFICATION_WEBHOOK: 'http://127.0.0.1:3199/discord-webhook',
  // A local stand-in for Bluesky's public API (see orgs.spec.js).
  BLUESKY_API: 'http://127.0.0.1:3198',
  // A local stand-in for Twitch and IGDB (see igdb.spec.js).
  TWITCH_OAUTH_API: 'http://127.0.0.1:3197/oauth2',
  IGDB_API: 'http://127.0.0.1:3197/v4',
  IGDB_CLIENT_ID: 'standin',
  IGDB_CLIENT_SECRET: 'standin',
};

const run = (command, args) =>
  execFileSync(command, args, { stdio: ['ignore', 'inherit', 'inherit'] });
run('node', ['scripts/reset-local-db.mjs', state]);
run('npx', ['react-router', 'build']);
// The build copies .env or .dev.vars here, for `vite preview`: replace it.
fs.writeFileSync(
  'build/server/.dev.vars',
  Object.entries(vars)
    .map(([name, value]) => `${name}=${value}`)
    .join('\n') + '\n'
);

spawn('npx', ['vite', 'preview', '--port', port, '--strictPort'], {
  stdio: 'inherit',
  env: { ...process.env, D1_PERSIST_PATH: `${state}/v3` },
});
