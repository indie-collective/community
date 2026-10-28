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
  // Tests change data and read it back signed out: no edge cache.
  EDGE_CACHE: 'off',
  // Sign in by email alone, with the accounts scripts/seed.mjs creates.
  DEV_SIGNIN: 'true',
  // A local catcher (see auth.spec.js) stands in for Discord's webhook.
  DISCORD_NOTIFICATION_WEBHOOK: 'http://127.0.0.1:3199/discord-webhook',
  // And for the moderators' channel (see moderation.spec.js).
  DISCORD_MODERATION_WEBHOOK: 'http://127.0.0.1:3195/moderation-webhook',
  // The harness members make more than 15 changes a run; moderation.spec.js
  // fills a new member's hour up to this.
  EDITS_PER_HOUR: '100',
  // A local stand-in for Bluesky's public API (see orgs.spec.js).
  BLUESKY_API: 'http://127.0.0.1:3198',
  // A local stand-in for the IC account's server (see bluesky.spec.js).
  BLUESKY_SERVICE: 'http://127.0.0.1:3196',
  BLUESKY_IDENTIFIER: 'indieco.test',
  BLUESKY_APP_PASSWORD: 'e2e-app-password',
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
