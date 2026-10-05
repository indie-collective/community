import { type RouteConfig, index, route } from '@react-router/dev/routes';

// Mirrors the old Remix v1 folder convention: dots in a file name are path
// segments, and only a sibling folder (e.g. `event.$id/`) creates nesting.
export default [
  index('routes/index.jsx'),

  route('about', 'routes/about.jsx'),
  route('sitemap.xml', 'routes/sitemap.xml.js'),
  route('robots.txt', 'routes/robots.txt.js'),
  route('coffee', 'routes/coffee.jsx'),
  route('healthcheck', 'routes/healthcheck.jsx'),
  route('rewind', 'routes/rewind.jsx'),
  route('welcome', 'routes/welcome.jsx'),

  // Auth & account
  route('signin', 'routes/signin.jsx'),
  route('logout', 'routes/logout.jsx'),
  route('check-username-availability', 'routes/check-username-availability.jsx'),
  route('auth/:provider', 'routes/auth/$provider.jsx'),
  route('auth/:provider/callback', 'routes/auth/$provider.callback.jsx'),
  route('profile', 'routes/profile.jsx'),
  route('profile/edit', 'routes/profile.edit.jsx'),

  // Search
  route('search', 'routes/search.jsx'),
  route('search-event', 'routes/search-event.jsx'),
  route('search-game', 'routes/search-game.jsx'),
  route('search-org', 'routes/search-org.jsx'),

  // Places
  route('places', 'routes/places.jsx'),
  route('places2', 'routes/places2.jsx'),
  route('countries', 'routes/countries.jsx'),
  route('country/:code', 'routes/country.$code.jsx'),

  // Events
  route('events', 'routes/events.jsx'),
  route('events/create', 'routes/events.create.jsx'),
  route('event/:id', 'routes/event.$id.jsx', [
    route('delete', 'routes/event.$id/delete.jsx'),
    route('games/add', 'routes/event.$id/games.add.jsx'),
    route('games/delete', 'routes/event.$id/games.delete.jsx'),
    route('hosts/add', 'routes/event.$id/hosts.add.jsx'),
    route('hosts/delete', 'routes/event.$id/hosts.delete.jsx'),
  ]),
  route('event/:id/edit', 'routes/event.$id.edit.jsx'),
  route('event/:id/join', 'routes/event.$id.join.jsx'),
  route('event/:id/leave', 'routes/event.$id.leave.jsx'),
  route('event/:id/changes', 'routes/event.$id.changes.jsx', [
    index('routes/event.$id.changes/index.jsx'),
    route(':revisionId', 'routes/event.$id.changes/$revisionId.jsx'),
  ]),

  // Games
  route('games', 'routes/games.jsx'),
  route('games/create', 'routes/games.create.jsx'),
  route('game/:id', 'routes/game.$id.jsx', [
    route('delete', 'routes/game.$id/delete.jsx'),
    route('companies/add', 'routes/game.$id/companies.add.jsx'),
    route('companies/delete', 'routes/game.$id/companies.delete.jsx'),
    route('images/add', 'routes/game.$id/images.add.jsx'),
    route('images/delete', 'routes/game.$id/images.delete.jsx'),
  ]),
  route('game/:id/edit', 'routes/game.$id.edit.jsx'),
  route('game/:id/changes', 'routes/game.$id.changes.jsx', [
    index('routes/game.$id.changes/index.jsx'),
    route(':revisionId', 'routes/game.$id.changes/$revisionId.jsx'),
  ]),

  // Organizations
  route('orgs', 'routes/orgs.jsx'),
  route('orgs/create', 'routes/orgs.create.jsx'),
  route('associations', 'routes/associations.jsx'),
  route('studios', 'routes/studios.jsx'),
  route('org/:id', 'routes/org.$id.jsx'),
  route('org/:id/edit', 'routes/org.$id.edit.jsx'),
  route('org/:id/delete', 'routes/org.$id.delete.jsx'),
  route('org/:id/changes', 'routes/org.$id.changes.jsx', [
    index('routes/org.$id.changes/index.jsx'),
    route(':revisionId', 'routes/org.$id.changes/$revisionId.jsx'),
  ]),

  // Admin
  route('admin/changes', 'routes/admin/changes.jsx'),
  route('admin/missing', 'routes/admin/missing.jsx'),
  route('admin/tags', 'routes/admin/tags.jsx'),
  route('admin/users', 'routes/admin/users.jsx'),

  route('*', 'routes/$.jsx'),
] satisfies RouteConfig;
