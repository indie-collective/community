import { type RouteConfig, index, route } from '@react-router/dev/routes';

// Mirrors the old Remix v1 folder convention: dots in a file name are path
// segments, and only a sibling folder (e.g. `event.$id/`) creates nesting.
//
// Every page is in the navigation, the footer or the sitemap, or linked from
// another page, except these, unlinked on purpose (#348): healthcheck,
// robots.txt, images/*, oauth/*, calendars and feeds (for machines), welcome (where sign-up
// lands), check-username-availability and search-* (fetched by forms and
// pickers), places2 (an old address) and coffee (an easter egg).
export default [
  index('routes/index.jsx'),

  route('about', 'routes/about.jsx'),
  // Open data (#304).
  route('data', 'routes/data.jsx'),
  route('data/:file', 'routes/data.$file.js'),
  route('sitemap.xml', 'routes/sitemap.xml.js'),
  route('robots.txt', 'routes/robots.txt.js'),
  // Calendars and feeds (#342).
  route('calendar.ics', 'routes/feeds/calendar.js', { id: 'calendar-all' }),
  route('country/:code/calendar.ics', 'routes/feeds/calendar.js', { id: 'calendar-country' }),
  route('org/:id/calendar.ics', 'routes/feeds/calendar.js', { id: 'calendar-org' }),
  route('event/:id/calendar.ics', 'routes/feeds/calendar.js', { id: 'calendar-event' }),
  route('my-calendar/:token', 'routes/feeds/calendar.js', { id: 'calendar-mine' }),
  route('feed.xml', 'routes/feeds/atom.js', { id: 'feed-all' }),
  route('games/feed.xml', 'routes/feeds/atom.js', { id: 'feed-games' }),
  route('events/feed.xml', 'routes/feeds/atom.js', { id: 'feed-events' }),
  route('orgs/feed.xml', 'routes/feeds/atom.js', { id: 'feed-orgs' }),
  // An easter egg, kept on purpose: 418 I'm a teapot.
  route('coffee', 'routes/coffee.jsx'),
  route('healthcheck', 'routes/healthcheck.jsx'),
  route('images/*', 'routes/images.$.js'),
  route('rewind', 'routes/rewind.jsx'),
  route('rewind/:year', 'routes/rewind.$year.jsx'),
  route('welcome', 'routes/welcome.jsx'),

  // Auth & account
  route('signin', 'routes/signin.jsx'),
  route('logout', 'routes/logout.jsx'),
  route('check-username-availability', 'routes/check-username-availability.jsx'),
  route('auth/bluesky/callback', 'routes/auth/bluesky.callback.jsx'),
  route('oauth/client-metadata.json', 'routes/oauth.client-metadata.json.js'),
  route('profile', 'routes/profile.jsx'),
  route('profile/edit', 'routes/profile.edit.jsx'),
  route('profile/bluesky', 'routes/profile.bluesky.jsx'),
  route('people/:username', 'routes/people.$username.jsx'),
  // Follows and notifications (#343).
  route('follow', 'routes/follow.js'),
  route('notifications', 'routes/notifications.jsx'),
  route('my-feed/:token', 'routes/feeds/notifications.js'),

  // Opportunities (#345)
  route('opportunities', 'routes/opportunities.jsx'),
  route('opportunities/new', 'routes/opportunities.new.jsx'),
  route('opportunities/:id/delete', 'routes/opportunities.$id.delete.js'),

  // Duplicates (#346)
  route('duplicates', 'routes/duplicates/likely.js'),
  route('duplicates/flag', 'routes/duplicates/flag.js'),

  // Search
  route('search', 'routes/search.jsx'),
  route('search-event', 'routes/search-event.jsx'),
  route('search-game', 'routes/search-game.jsx'),
  route('search-org', 'routes/search-org.jsx'),
  route('search-suggest', 'routes/search-suggest.js'),

  // Places
  route('places', 'routes/places.jsx'),
  route('places2', 'routes/places2.js'),
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

  // Games
  route('games', 'routes/games.jsx'),
  route('games/create', 'routes/games.create.jsx'),
  route('game/:id', 'routes/game.$id.jsx', [
    route('delete', 'routes/game.$id/delete.jsx'),
    route('companies/add', 'routes/game.$id/companies.add.jsx'),
    route('companies/delete', 'routes/game.$id/companies.delete.jsx'),
    route('companies/role', 'routes/game.$id/companies.role.jsx'),
    route('images/add', 'routes/game.$id/images.add.jsx'),
    route('images/delete', 'routes/game.$id/images.delete.jsx'),
    route('milestones/add', 'routes/game.$id/milestones.add.jsx'),
    route('milestones/delete', 'routes/game.$id/milestones.delete.jsx'),
  ]),
  route('game/:id/edit', 'routes/game.$id.edit.jsx'),

  // Organizations
  route('orgs', 'routes/orgs.jsx'),
  route('orgs/create', 'routes/orgs.create.jsx'),
  route('associations', 'routes/associations.jsx'),
  route('studios', 'routes/studios.jsx'),
  route('publishers', 'routes/publishers.jsx'),
  route('org/:id', 'routes/org.$id.jsx'),
  route('org/:id/edit', 'routes/org.$id.edit.jsx'),
  route('org/:id/delete', 'routes/org.$id.delete.jsx'),

  // Admin
  route('admin/changes', 'routes/admin/changes.jsx'),
  route('admin/missing', 'routes/admin/missing.jsx'),
  route('admin/duplicates', 'routes/admin/duplicates.jsx'),
  route('admin/bluesky', 'routes/admin/bluesky.jsx'),
  route('admin/duplicates/merge', 'routes/admin/duplicates.merge.jsx'),
  route('admin/tags', 'routes/admin/tags.jsx'),
  route('admin/users', 'routes/admin/users.jsx'),

  route('*', 'routes/$.jsx'),
] satisfies RouteConfig;
