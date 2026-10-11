#!/usr/bin/env node
/**
 * Backs up the D1 database to a SQL file, and proves it restores (ADR 0002,
 * #151): run by .github/workflows/backup-d1.yml every day.
 *
 * `wrangler d1 export` can't export a database with a virtual table, and
 * search has one (#306), so the tables are read with queries instead. The
 * file holds, in order: the tables, indexes and views; every table's rows
 * (foreign keys checked at the end, so the order doesn't matter); the
 * full-text index, rebuilt from its view; and the triggers that keep it
 * current, last, so restoring doesn't run them for every row.
 *
 * The file is restored into a throwaway local D1, and every table's row
 * count is checked against the rows in the file, and the search index
 * against its view.
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

// Each full-text index, and the view it's built from (migration 0004).
const REBUILT_FROM = { search_index: 'search_documents' };
const PAGE = 1000;

const [where, output] = process.argv.slice(2);
if (!['--remote', '--local'].includes(where) || !output) {
  console.error(
    'Usage: node scripts/backup-d1.mjs --remote|--local <output.sql>'
  );
  process.exit(1);
}

const wrangler = (...args) =>
  execFileSync('npx', ['wrangler', 'd1', ...args], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
const query = (sql, ...location) => {
  const json = wrangler(
    'execute',
    'DB',
    ...location,
    '--json',
    '--command',
    sql
  );
  return JSON.parse(json.slice(json.indexOf('[')))[0].results;
};

const quoteName = (name) => `"${name.replace(/"/g, '""')}"`;
function literal(value) {
  if (value === null) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
  throw new Error(
    `Can't back up a ${typeof value} value: ${JSON.stringify(value)}`
  );
}

// The schema, in creation order, sorted into what goes before the data and
// what goes after it.
const objects = query(
  `select type, name, sql from sqlite_master
   where sql is not null and name not like 'sqlite_%' and name not like '_cf_%'
   order by rowid`,
  where
);
const virtual = objects
  .filter((o) => o.type === 'table' && /^CREATE VIRTUAL TABLE/i.test(o.sql))
  .map((o) => o.name);
const unknown = virtual.filter((name) => !REBUILT_FROM[name]);
if (unknown.length) {
  console.error(
    `Don't know how to rebuild ${unknown.join(', ')}: add it to REBUILT_FROM.`
  );
  process.exit(1);
}
// A virtual table's own storage ("search_index_data", …) is rebuilt with it.
const isVirtual = (name) =>
  virtual.some((table) => name === table || name.startsWith(`${table}_`));
const before = objects.filter(
  (o) => o.type !== 'trigger' && !isVirtual(o.name)
);
const tables = before.filter((o) => o.type === 'table').map((o) => o.name);
const triggers = objects.filter((o) => o.type === 'trigger');

const statements = ['PRAGMA defer_foreign_keys = true;'];
for (const object of before) statements.push(`${object.sql};`);

const rowCounts = {};
for (const table of tables) {
  rowCounts[table] = 0;
  for (let offset = 0; ; offset += PAGE) {
    const rows = query(
      `select * from ${quoteName(table)} order by rowid limit ${PAGE} offset ${offset}`,
      where
    );
    for (const row of rows) {
      const columns = Object.keys(row);
      statements.push(
        `INSERT INTO ${quoteName(table)} (${columns.map(quoteName).join(', ')}) VALUES (${columns
          .map((column) => literal(row[column]))
          .join(', ')});`
      );
    }
    rowCounts[table] += rows.length;
    if (rows.length < PAGE) break;
  }
}

for (const name of virtual) {
  statements.push(`${objects.find((o) => o.name === name).sql};`);
  statements.push(
    `INSERT INTO ${quoteName(name)} SELECT * FROM ${quoteName(REBUILT_FROM[name])};`
  );
}
for (const trigger of triggers) statements.push(`${trigger.sql};`);
fs.writeFileSync(output, statements.join('\n') + '\n');

// Restore it into a throwaway local D1, and count.
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'd1-backup-'));
try {
  const restore = ['--local', '--persist-to', path.join(work, 'restore')];
  wrangler('execute', 'DB', ...restore, '--file', output);
  const [counts] = query(
    `select ${[
      ...tables.map(
        (table) =>
          `(select count(*) from ${quoteName(table)}) as ${quoteName(table)}`
      ),
      ...virtual.flatMap((name) => [
        `(select count(*) from ${quoteName(name)}) as ${quoteName(name)}`,
        `(select count(*) from ${quoteName(REBUILT_FROM[name])}) as ${quoteName(REBUILT_FROM[name])}`,
      ]),
    ].join(', ')}`,
    ...restore
  );

  console.table(Object.fromEntries(tables.map((t) => [t, counts[t]])));
  const wrong = [
    ...tables.filter((table) => counts[table] !== rowCounts[table]),
    ...virtual.filter((name) => counts[name] !== counts[REBUILT_FROM[name]]),
  ];
  if (wrong.length) {
    console.error(
      `The backup doesn't restore these tables whole: ${wrong.join(', ')}`
    );
    process.exit(1);
  }
  const size = (fs.statSync(output).size / 1024 / 1024).toFixed(1);
  console.log(
    `Backed up ${tables.length} tables to ${output} (${size} MB); it restores, every row, and the search index.`
  );
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
