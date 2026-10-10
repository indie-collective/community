#!/usr/bin/env node
/**
 * Makes a fresh local D1: deletes it, applies the migrations, and seeds it
 * (scripts/seed.mjs). The end-to-end tests run on one made this way.
 *
 * Usage:
 *   node scripts/reset-local-db.mjs [path]   # default .wrangler/state
 *
 * The app and scripts then open it with D1_PERSIST_PATH=<path>/v3.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const dir = process.argv[2] ?? '.wrangler/state';

fs.rmSync(dir, { recursive: true, force: true });
const run = (command, args, env = {}) =>
  execFileSync(command, args, {
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, ...env },
  });
run('npx', ['wrangler', 'd1', 'migrations', 'apply', 'DB', '--local', '--persist-to', dir]);
run('node', ['scripts/seed.mjs'], { D1_PERSIST_PATH: `${dir}/v3` });
console.log(`A fresh local D1 in ${dir}.`);
