// Builds routes.json: every visitable URL in the app, with real ids pulled
// from the seeded database. Run with DATABASE_URL set (see README).
import { writeFileSync } from 'node:fs';
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const one = async (sql) => (await client.query(sql)).rows[0] ?? null;

// Prefer records with related data, so their pages render every section.
const game = await one(`
  select g.id from game g
  where not coalesce(g.deleted, false)
  order by (select count(*) from game_image gi where gi.game_id = g.id) desc,
           (select count(*) from game_entity ge where ge.game_id = g.id) desc
  limit 1`);
const event = await one(`
  select e.id from event e
  order by (e.location_id is not null) desc,
           (select count(*) from game_event ge where ge.event_id = e.id) desc
  limit 1`);
const studio = await one(`select id from entity where type = 'studio' order by (logo_id is not null) desc limit 1`);
const association = await one(`select id from entity where type = 'association' order by (logo_id is not null) desc limit 1`);
const country = await one(`
  select l.country_code from location l join entity e on e.location_id = l.id
  group by l.country_code order by count(*) desc limit 1`);
const change = async (table, id) =>
  id && one(`select id from change where table_name = '${table}' and record_id = '${id}' order by created_at desc limit 1`);
const gameChange = await change('game', game?.id);
const eventChange = await change('event', event?.id);
const orgChange = await change('entity', studio?.id);

await client.end();

// needs: env vars the route depends on that the local .env lacks. A failure
// on such a route is "unverifiable locally", never a bug.
// auth: none | member | admin — which seeded account the capture signs in as.
const routes = [
  // Public
  { path: '/', auth: 'none', needs: ['CDN_HOST'] },
  { path: '/about', auth: 'none' },
  { path: '/coffee', auth: 'none' },
  { path: '/games', auth: 'none', needs: ['CDN_HOST'] },
  { path: `/game/${game?.id}`, auth: 'none', needs: ['CDN_HOST', 'IGDB_CLIENT_ID'] },
  { path: `/game/${game?.id}/changes`, auth: 'member' },
  gameChange && { path: `/game/${game.id}/changes/${gameChange.id}`, auth: 'member' },
  { path: '/events', auth: 'none', needs: ['CDN_HOST'] },
  { path: `/event/${event?.id}`, auth: 'none', needs: ['CDN_HOST'] },
  { path: `/event/${event?.id}/changes`, auth: 'member' },
  eventChange && { path: `/event/${event.id}/changes/${eventChange.id}`, auth: 'member' },
  { path: '/orgs', auth: 'none', needs: ['CDN_HOST'] },
  { path: '/studios', auth: 'none', needs: ['CDN_HOST'] },
  { path: '/associations', auth: 'none', needs: ['CDN_HOST'] },
  { path: `/org/${studio?.id}`, auth: 'none', needs: ['CDN_HOST'] },
  { path: `/org/${association?.id}`, auth: 'none', needs: ['CDN_HOST'] },
  { path: `/org/${studio?.id}/changes`, auth: 'member' },
  orgChange && { path: `/org/${studio.id}/changes/${orgChange.id}`, auth: 'member' },
  { path: '/countries', auth: 'none' },
  { path: `/country/${country?.country_code?.toLowerCase()}`, auth: 'none' },
  { path: '/places', auth: 'none', note: 'map stack: pigeon-maps tiles, supercluster' },
  { path: '/places2', auth: 'none', note: 'map stack: pigeon-maps tiles, supercluster' },
  { path: '/search', auth: 'none', note: 'no query' },
  { path: '/search?q=game', auth: 'none', needs: ['CDN_HOST'] },
  { path: '/search-game?q=game', auth: 'none' },
  { path: '/search-org?q=a', auth: 'none' },
  { path: '/search-event?q=a', auth: 'none' },
  { path: '/rewind', auth: 'none', needs: ['CDN_HOST'] },
  { path: '/healthcheck', auth: 'none' },
  { path: '/this-page-does-not-exist', auth: 'none', note: '$ catch-all' },
  { path: '/signin', auth: 'none' },
  { path: '/signup', auth: 'none', note: 'submitting needs pgcrypto, absent from the local database' },
  { path: '/forgot', auth: 'none', needs: ['SENDGRID_API_KEY', 'BASE_URL'], note: 'renders; sending needs SendGrid' },
  { path: '/reset/00000000-0000-0000-0000-000000000000', auth: 'none', note: 'fake token; real ones arrive by email' },

  // Authenticated
  { path: '/welcome', auth: 'member' },
  { path: '/profile', auth: 'member' },
  { path: '/profile/edit', auth: 'member', needs: ['CDN_HOST'] },
  { path: '/check-username-availability?username=harness-member', auth: 'member' },
  { path: '/games/create', auth: 'member', needs: ['IGDB_CLIENT_ID'] },
  { path: `/game/${game?.id}/edit`, auth: 'member', needs: ['IGDB_CLIENT_ID', 'CDN_HOST'] },
  { path: '/events/create', auth: 'member' },
  { path: `/event/${event?.id}/edit`, auth: 'member', needs: ['CDN_HOST'] },
  { path: '/orgs/create', auth: 'member' },
  { path: `/org/${studio?.id}/edit`, auth: 'member', needs: ['CDN_HOST'] },
  { path: '/admin/changes', auth: 'admin' },
  { path: '/admin/missing', auth: 'admin' },
  { path: '/admin/tags', auth: 'admin' },
  { path: '/admin/users', auth: 'admin' },
].filter(Boolean);

// Action-only routes: no page to capture. They are exercised by submitting
// the forms that post to them (#146).
const actionOnly = [
  '/logout',
  '/auth/:provider',
  '/auth/:provider/callback',
  '/event/:id/join',
  '/event/:id/leave',
  '/event/:id/delete',
  '/event/:id/games/add',
  '/event/:id/games/delete',
  '/event/:id/hosts/add',
  '/event/:id/hosts/delete',
  '/game/:id/delete',
  '/game/:id/companies/add',
  '/game/:id/companies/delete',
  '/game/:id/images/add',
  '/game/:id/images/delete',
  '/org/:id/delete',
];

const missing = routes.filter((r) => r.path.includes('undefined'));
if (missing.length) {
  console.error('Seeded database is missing records for:', missing.map((r) => r.path));
  process.exit(1);
}

writeFileSync(new URL('./routes.json', import.meta.url), JSON.stringify({ routes, actionOnly }, null, 2) + '\n');
console.log(`${routes.length} routes, ${actionOnly.length} action-only`);
