#!/usr/bin/env node
/**
 * Backs up the D1 database to a SQL file, and proves it restores (ADR 0002,
 * #151): run by .github/workflows/backup.yml every day.
 *
 * The file holds the schema, then the data. (A single `wrangler d1 export`
 * lists tables alphabetically, so a row can arrive before the table it
 * refers to, and the file doesn't restore.) It's restored into a throwaway
 * local D1, and every table's row count is checked against the rows in the
 * file.
 *
 * Usage: node scripts/backup-d1.mjs --remote|--local <output.sql>
 *
 * To restore into an empty database:
 *   npx wrangler d1 execute <database> --remote --file <output.sql>
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [where, output] = process.argv.slice(2);
if (!['--remote', '--local'].includes(where) || !output) {
  console.error('Usage: node scripts/backup-d1.mjs --remote|--local <output.sql>');
  process.exit(1);
}

const wrangler = (...args) =>
  execFileSync('npx', ['wrangler', 'd1', ...args], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'd1-backup-'));
try {
  const schema = path.join(work, 'schema.sql');
  const data = path.join(work, 'data.sql');
  wrangler('export', 'DB', where, '--no-data', '--output', schema);
  wrangler('export', 'DB', where, '--no-schema', '--output', data);
  fs.writeFileSync(
    output,
    fs.readFileSync(schema, 'utf8') + '\n' + fs.readFileSync(data, 'utf8')
  );

  // The rows the file holds, per table.
  const expected = {};
  for (const [, table] of fs
    .readFileSync(data, 'utf8')
    .matchAll(/^INSERT INTO "([^"]+)"/gm)) {
    expected[table] = (expected[table] ?? 0) + 1;
  }
  const tables = [
    ...fs.readFileSync(schema, 'utf8').matchAll(/^CREATE TABLE (?:IF NOT EXISTS )?[`"]([^`"]+)[`"]/gm),
  ].map(([, table]) => table);

  // Restore it into a throwaway local D1, and count.
  const restore = path.join(work, 'restore');
  wrangler('execute', 'DB', '--local', '--persist-to', restore, '--file', output);
  const query = `select ${tables
    .map((table) => `(select count(*) from "${table}") as "${table}"`)
    .join(', ')}`;
  const json = wrangler('execute', 'DB', '--local', '--persist-to', restore, '--json', '--command', query);
  const [counts] = JSON.parse(json.slice(json.indexOf('[')))[0].results;

  const wrong = tables.filter((table) => counts[table] !== (expected[table] ?? 0));
  console.table(Object.fromEntries(tables.map((t) => [t, counts[t]])));
  if (wrong.length) {
    console.error(`The backup doesn't restore these tables whole: ${wrong.join(', ')}`);
    process.exit(1);
  }
  const size = (fs.statSync(output).size / 1024 / 1024).toFixed(1);
  console.log(`Backed up ${tables.length} tables to ${output} (${size} MB); it restores, every row.`);
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
