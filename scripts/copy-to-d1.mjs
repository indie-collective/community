/**
 * Copies the database from Postgres to D1, once, at the cutover (#151,
 * ADR 0003). Reads a Postgres in main's shape and writes SQL for the new
 * D1 schema; with --apply, loads it and checks every table's row count.
 *
 * Usage:
 *   1. Restore a Supabase export into a local Postgres, and bring it to
 *      main's shape (prisma migrate resolve for the three migrations
 *      production already has, then prisma migrate deploy; see #150).
 *   2. Create an empty D1 with the schema:
 *        npx wrangler d1 migrations apply DB --local   (or --remote)
 *   3. DATABASE_URL=postgres://… node scripts/copy-to-d1.mjs --apply local
 *      (or --apply remote; without --apply it only writes the SQL)
 *
 * Options: --out <file> (default d1-copy.sql); --admins <usernames> (comma-
 * separated; default engleek,yorunohikage, per #153; everyone else becomes
 * a member). The D1 must be empty.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import pg from 'pg';

import * as to from '../app/db/fromPostgres.js';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const out = option('--out', 'd1-copy.sql');
const apply = option('--apply', null);
const admins = new Set(
  option('--admins', 'engleek,yorunohikage')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
);
if (apply && !['local', 'remote'].includes(apply)) {
  console.error('--apply takes "local" or "remote".');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL must point to the Postgres to copy from.');
  process.exit(1);
}

// --- Read Postgres -----------------------------------------------------------

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const all = async (table) =>
  (await client.query(`select * from "${table}"`)).rows;
const old = {};
for (const table of [
  'person',
  'image',
  'location',
  'entity',
  'game',
  'event',
  'entity_event',
  'game_entity',
  'game_event',
  'event_participant',
  'game_image',
  'tag',
  'tag_alias',
  'game_tag',
  'change',
  'game_igdb',
  'kv_store',
]) {
  old[table] = await all(table);
}
await client.end();

const byId = (rows) => new Map(rows.map((row) => [row.id, row]));
const images = byId(old.image);
const locations = byId(old.location);

// --- Transform, in foreign-key order -----------------------------------------

const tables = [
  [
    'people',
    old.person.map((r) => to.person(r, images.get(r.avatar_id), admins)),
  ],
  [
    'organizations',
    old.entity.map((r) =>
      to.organization(r, locations.get(r.location_id), images.get(r.logo_id))
    ),
  ],
  ['games', old.game.map(to.game)],
  [
    'events',
    old.event.map((r) =>
      to.event(r, locations.get(r.location_id), images.get(r.cover_id))
    ),
  ],
  [
    'game_organizations',
    old.game_entity.map((r) =>
      to.withTimes(r, {
        game_id: 'game_id',
        organization_id: 'entity_id',
        role: 'role',
        created_at: 'created_at',
      })
    ),
  ],
  [
    'game_events',
    old.game_event.map((r) =>
      to.withTimes(r, {
        game_id: 'game_id',
        event_id: 'event_id',
        created_at: 'created_at',
      })
    ),
  ],
  [
    'organization_events',
    old.entity_event.map((r) =>
      to.withTimes(r, {
        organization_id: 'entity_id',
        event_id: 'event_id',
        created_at: 'created_at',
      })
    ),
  ],
  [
    'event_participants',
    old.event_participant.map((r) =>
      to.withTimes(r, {
        event_id: 'event_id',
        person_id: 'person_id',
        joined_at: 'joined_at',
      })
    ),
  ],
  ['game_images', to.gameImages(old.game_image, images)],
  [
    'tags',
    old.tag.map((r) =>
      to.withTimes(r, {
        id: 'id',
        name: 'name',
        created_at: 'created_at',
        updated_at: 'updated_at',
      })
    ),
  ],
  [
    'tag_aliases',
    old.tag_alias.map((r) =>
      to.withTimes(r, {
        alias: 'alias',
        tag_id: 'tag_id',
        created_at: 'created_at',
      })
    ),
  ],
  [
    'game_tags',
    old.game_tag.map((r) =>
      to.withTimes(r, {
        game_id: 'game_id',
        tag_id: 'tag_id',
        created_at: 'created_at',
      })
    ),
  ],
  ['changes', old.change.map(to.change)],
  [
    'game_igdb',
    old.game_igdb.map((r) => ({
      game_id: r.game_id,
      slug: r.slug,
      data: r.data == null ? null : JSON.stringify(r.data),
      fetched_at: to.ms(r.fetched_at),
      refresh_started_at: to.ms(r.refresh_started_at),
    })),
  ],
  [
    'kv',
    old.kv_store.map((r) => ({
      key: r.key,
      value: r.value,
      expires_at: to.ms(r.expires_at),
    })),
  ],
];

// --- Write SQL ---------------------------------------------------------------

const literal = (value) => {
  if (value == null) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new Error(`Not a finite number: ${value}`);
    return String(value);
  }
  return `'${String(value).replaceAll("'", "''")}'`;
};

// D1 caps a statement at 100 KB: batch rows up to ~90 KB.
const MAX_STATEMENT = 90_000;
const statements = [];
for (const [table, rows] of tables) {
  if (rows.length === 0) continue;
  const columns = Object.keys(rows[0]);
  const head = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES\n`;
  let batch = [];
  let size = head.length;
  const flush = () => {
    if (batch.length) statements.push(`${head}${batch.join(',\n')};`);
    batch = [];
    size = head.length;
  };
  for (const row of rows) {
    const values = `(${columns.map((c) => literal(row[c])).join(', ')})`;
    if (size + values.length > MAX_STATEMENT) flush();
    batch.push(values);
    size += values.length + 2;
  }
  flush();
}
fs.writeFileSync(out, statements.join('\n') + '\n');

const expected = Object.fromEntries(
  tables.map(([table, rows]) => [table, rows.length])
);
console.log(`Wrote ${out}: ${statements.length} statements.`);
console.table(expected);

// --- Apply and check -----------------------------------------------------------

if (apply) {
  const wrangler = (...more) =>
    execFileSync(
      'npx',
      ['wrangler', 'd1', 'execute', 'DB', `--${apply}`, ...more],
      {
        encoding: 'utf8',
        env: { ...process.env, CI: '1' },
        stdio: ['ignore', 'pipe', 'inherit'],
        maxBuffer: 64 * 1024 * 1024,
      }
    );
  const count = () => {
    // One row of subqueries: D1 limits how many parts a UNION may have.
    const query = `select ${Object.keys(expected)
      .map((table) => `(select count(*) from "${table}") as "${table}"`)
      .join(', ')}`;
    const [result] = JSON.parse(wrangler('--json', '--command', query));
    return result.results[0];
  };

  const before = count();
  const filled = Object.entries(before).filter(([, n]) => n > 0);
  if (filled.length) {
    console.error(
      `The D1 isn't empty (${filled.map(([t, n]) => `${t}: ${n}`).join(', ')}).`
    );
    process.exit(1);
  }
  wrangler('--file', out);
  const after = count();
  const wrong = Object.keys(expected).filter(
    (table) => after[table] !== expected[table]
  );
  if (wrong.length) {
    console.error('Row counts differ:');
    for (const table of wrong)
      console.error(
        `  ${table}: expected ${expected[table]}, got ${after[table]}`
      );
    process.exit(1);
  }
  console.log(`Copied into the ${apply} D1; every table's row count matches.`);
}
