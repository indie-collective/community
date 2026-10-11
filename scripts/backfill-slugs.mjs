#!/usr/bin/env node
/**
 * Gives every game, organisation and event without a slug its slug (#209),
 * once, after migration 0003 on a database copied before it. (The copy
 * script assigns slugs itself; new records get theirs when created.)
 *
 * Usage: node scripts/backfill-slugs.mjs --to local|remote [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assignSlugs } from '../app/utils/slug.js';

const args = process.argv.slice(2);
const to = args[args.indexOf('--to') + 1];
const dryRun = args.includes('--dry-run');
if (!['local', 'remote'].includes(to)) {
  console.error('Usage: node scripts/backfill-slugs.mjs --to local|remote [--dry-run]');
  process.exit(1);
}

const d1 = (...more) =>
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', `--${to}`, ...more], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
const query = (sql) => {
  const out = d1('--json', '--command', sql);
  return JSON.parse(out.slice(out.indexOf('[')))[0].results;
};
const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;

const updates = [];
for (const [table, event] of [['games', false], ['organizations', false], ['events', true]]) {
  const rows = query(
    `select id, name, slug, created_at as createdAt${event ? ', starts_at as startsAt' : ''} from ${table}`
  );
  const missing = rows.filter((row) => !row.slug);
  const taken = new Set(rows.map((row) => row.slug).filter(Boolean));
  const slugs = assignSlugs(missing, { event, taken });
  for (const [id, slug] of slugs) {
    updates.push(`UPDATE ${table} SET slug = ${literal(slug)} WHERE id = ${literal(id)} AND slug IS NULL;`);
  }
  console.log(`${table}: ${missing.length} of ${rows.length} without a slug.`);
}

if (updates.length === 0) {
  console.log('Nothing to do.');
} else if (dryRun) {
  console.log(updates.slice(0, 10).join('\n'), updates.length > 10 ? `\n… ${updates.length} in all` : '');
} else {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'slugs-')), 'slugs.sql');
  fs.writeFileSync(file, updates.join('\n') + '\n');
  d1('--file', file);
  const [left] = query(
    'select (select count(*) from games where slug is null) + (select count(*) from organizations where slug is null) + (select count(*) from events where slug is null) as n'
  );
  console.log(`Gave ${updates.length} records their slug; ${left.n} left without one.`);
  if (left.n) process.exitCode = 1;
}
