#!/usr/bin/env node
/**
 * Copies the existing images, and their thumbnails, from the old bucket to
 * R2 (ADR 0002): a cutover step, after the data is in D1 (copy-to-d1.mjs).
 *
 * The keys come from D1 (games' images, organisations' logos, events'
 * covers, people's avatars); each `<key>` and `thumb_<key>` is downloaded
 * from the old CDN, which serves them publicly, and put in the R2 bucket
 * with wrangler. A missing thumbnail is replaced by the image itself, as
 * uploads do; a missing image is reported.
 *
 * Usage:
 *   node scripts/copy-images-to-r2.mjs --to local|remote [--from https://cdn.indieco.xyz]
 *     [--concurrency 8] [--limit N]
 *
 * - Resumable: copied keys are listed in .wrangler/r2-copy-<to>.txt and
 *   skipped on the next run (delete it to start over).
 * - --limit N copies at most N images (a trial run).
 * - Exits with an error when an image couldn't be copied.
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const BUCKET = 'indieco-community-images';
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const to = option('--to');
const from = option('--from', 'https://cdn.indieco.xyz').replace(/\/+$/, '');
const concurrency = Number(option('--concurrency', 8));
const limit = Number(option('--limit', Infinity));
if (!['local', 'remote'].includes(to)) {
  console.error('Usage: node scripts/copy-images-to-r2.mjs --to local|remote [--from URL]');
  process.exit(1);
}

// The keys of every image in D1 (URLs are images hosted elsewhere).
async function imageKeys() {
  const query = `
    select key from game_images
    union select logo_key from organizations where logo_key is not null
    union select cover_key from events where cover_key is not null
    union select avatar_key from people where avatar_key is not null`;
  const { stdout } = await run(
    'npx',
    ['wrangler', 'd1', 'execute', 'DB', `--${to}`, '--json', '--command', query],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  return JSON.parse(stdout)[0]
    .results.map(({ key }) => key)
    .filter((key) => key && !/^https?:/.test(key))
    .sort();
}

async function download(name) {
  const response = await fetch(`${from}/${encodeURIComponent(name)}`);
  if (response.status === 403 || response.status === 404) return null;
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return {
    body: Buffer.from(await response.arrayBuffer()),
    type: response.headers.get('content-type') ?? 'application/octet-stream',
  };
}

async function put(name, { body, type }) {
  const file = path.join(os.tmpdir(), `r2-copy-${process.pid}-${name}`);
  fs.writeFileSync(file, body);
  try {
    // Concurrent puts sometimes fail (the local store is locked, the
    // network blips): try again, a little later each time.
    for (let attempt = 1; ; attempt++) {
      try {
        await run('npx', [
          'wrangler', 'r2', 'object', 'put', `${BUCKET}/${name}`,
          '--file', file,
          '--content-type', type,
          '--cache-control', CACHE_CONTROL,
          `--${to}`,
        ]);
        return;
      } catch (error) {
        if (attempt === 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  } finally {
    fs.rmSync(file, { force: true });
  }
}

const progressFile = `.wrangler/r2-copy-${to}.txt`;
fs.mkdirSync('.wrangler', { recursive: true });
const done = new Set(
  fs.existsSync(progressFile)
    ? fs.readFileSync(progressFile, 'utf8').split('\n').filter(Boolean)
    : []
);

const keys = await imageKeys();
const todo = keys.filter((key) => !done.has(key)).slice(0, limit);
console.log(
  `${keys.length} images in D1; ${done.size} already copied; copying ${todo.length} from ${from} to the ${to} R2.`
);

const missing = [];
const failed = [];
let thumbsReplaced = 0;
let copied = 0;

async function copy(key) {
  try {
    const image = await download(key);
    if (!image) {
      missing.push(key);
      return;
    }
    let thumbnail = await download(`thumb_${key}`);
    if (!thumbnail) {
      thumbnail = image;
      thumbsReplaced++;
    }
    await put(key, image);
    await put(`thumb_${key}`, thumbnail);
    fs.appendFileSync(progressFile, key + '\n');
    copied++;
    if (copied % 50 === 0) console.log(`${copied} of ${todo.length} copied`);
  } catch (error) {
    const detail = (error.stderr || error.message).trim().split('\n').filter(Boolean).at(-1);
    failed.push(`${key}: ${detail}`);
  }
}

// A few at a time: each put is a wrangler process.
const queue = [...todo];
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (queue.length) await copy(queue.shift());
  })
);

console.log(
  `Copied ${copied} images and their thumbnails (${thumbsReplaced} thumbnails were missing and replaced by their image).`
);
if (missing.length) {
  console.log(`${missing.length} images are missing from ${from}:\n  ${missing.join('\n  ')}`);
}
if (failed.length) {
  console.error(`${failed.length} failed (run again to retry):\n  ${failed.join('\n  ')}`);
  process.exitCode = 1;
}
