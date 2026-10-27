// The D1 (SQLite) schema, with Drizzle (ADR 0003, #151). Tables are plural
// and snake_case in the database, camelCase in code. No database logic: the
// change log and soft delete are written by the app.
import { relations, sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const ORGANIZATION_TYPES = ['studio', 'association'];
export const ORGANIZATION_STATUSES = ['active', 'closed', 'hiatus'];
export const EVENT_STATUSES = ['ongoing', 'canceled'];
// Where people take part (#347): at a place, online, or both.
export const EVENT_ATTENDANCES = ['in_person', 'online', 'hybrid'];
export const GAME_ORGANIZATION_ROLES = [
  'developer',
  'co_developer',
  'publisher',
  'porting',
  'support',
];
// A step in a game's life (#332), as shown on its timeline.
export const GAME_MILESTONE_KINDS = [
  'announced',
  'prototype',
  'alpha',
  'beta',
  'demo',
  'early_access',
  'funded',
  'signed',
  'released',
  'ported',
  'update',
  'other',
];
// How much of a milestone's date is known: the year, the month or the day.
export const DATE_PRECISIONS = ['year', 'month', 'day'];
export const PERSON_ROLES = ['admin', 'member', 'restricted'];
export const CHANGE_OPERATIONS = ['create', 'update', 'delete'];

// Text with a CHECK constraint for an enum's values.
const oneOf = (column, values) =>
  sql`${column} in (${sql.join(
    values.map((v) => sql.raw(`'${v}'`)),
    sql`, `
  )})`;

// Unix milliseconds, read and written as Dates.
const time = (name) => integer(name, { mode: 'timestamp_ms' });
const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const timestamps = () => ({
  createdAt: time('created_at')
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: time('updated_at')
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// Where an organisation or event is; all optional (some have no place).
const location = () => ({
  countryCode: text('country_code'),
  region: text('region'),
  city: text('city'),
  street: text('street'),
  latitude: real('latitude'),
  longitude: real('longitude'),
});

// An image in the bucket: its key, and its size for layout. The thumbnail
// is `thumb_<key>` (ADR 0002).
const image = (prefix) => ({
  [`${prefix}Key`]: text(`${prefix}_key`),
  [`${prefix}Width`]: integer(`${prefix}_width`),
  [`${prefix}Height`]: integer(`${prefix}_height`),
});

export const people = sqliteTable(
  'people',
  {
    id: id(),
    username: text('username').notNull().unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    about: text('about'),
    email: text('email').unique(),
    ...image('avatar'),
    // A picture from the sign-in provider, when there's no uploaded avatar.
    avatarUrl: text('avatar_url'),
    role: text('role', { enum: PERSON_ROLES }).notNull().default('member'),
    // The Bluesky identity (#162), and its handle, refreshed at each
    // Bluesky sign-in (#161): handles can change, the DID doesn't.
    did: text('did').unique(),
    bskyHandle: text('bsky_handle'),
    // Until the cutover to Bluesky sign-in (ADR 0002).
    discordId: text('discord_id').unique(),
    // #341: profiles are public unless the member hides theirs.
    profileHidden: integer('profile_hidden', { mode: 'boolean' }).notNull().default(false),
    ...timestamps(),
  },
  (t) => [
    check('people_role', oneOf(t.role, PERSON_ROLES)),
    check('people_username_length', sql`length(${t.username}) <= 30`),
  ]
);

export const organizations = sqliteTable(
  'organizations',
  {
    id: id(),
    type: text('type', { enum: ORGANIZATION_TYPES }).notNull(),
    status: text('status', { enum: ORGANIZATION_STATUSES })
      .notNull()
      .default('active'),
    name: text('name').notNull(),
    // #209: its URL (/org/<slug>); null until backfilled.
    slug: text('slug'),
    about: text('about'),
    site: text('site'),
    // #161: e.g. studio.bsky.social.
    bskyHandle: text('bsky_handle'),
    ...location(),
    ...image('logo'),
    searchText: text('search_text').notNull().default(''),
    deletedAt: time('deleted_at'),
    lastModifiedById: text('last_modified_by_id').references(() => people.id, {
      onDelete: 'set null',
    }),
    ...timestamps(),
  },
  (t) => [
    check('organizations_type', oneOf(t.type, ORGANIZATION_TYPES)),
    check('organizations_status', oneOf(t.status, ORGANIZATION_STATUSES)),
    index('organizations_country_code').on(t.countryCode),
    index('organizations_type_index').on(t.type),
    index('organizations_deleted_at').on(t.deletedAt),
    uniqueIndex('organizations_slug').on(t.slug),
  ]
);

export const games = sqliteTable(
  'games',
  {
    id: id(),
    name: text('name').notNull(),
    // #209: its URL (/game/<slug>); null until backfilled.
    slug: text('slug'),
    about: text('about'),
    site: text('site'),
    igdbSlug: text('igdb_slug').unique(),
    searchText: text('search_text').notNull().default(''),
    deletedAt: time('deleted_at'),
    lastModifiedById: text('last_modified_by_id').references(() => people.id, {
      onDelete: 'set null',
    }),
    ...timestamps(),
  },
  (t) => [
    index('games_deleted_at').on(t.deletedAt),
    index('games_updated_at').on(t.updatedAt),
    uniqueIndex('games_slug').on(t.slug),
  ]
);

export const events = sqliteTable(
  'events',
  {
    id: id(),
    name: text('name').notNull(),
    // #209: its URL (/event/<slug>); null until backfilled.
    slug: text('slug'),
    about: text('about'),
    site: text('site'),
    startsAt: time('starts_at').notNull(),
    endsAt: time('ends_at').notNull(),
    // The IANA zone its times are shown and entered in (#204).
    timeZone: text('time_zone').notNull().default('Europe/Paris'),
    status: text('status', { enum: EVENT_STATUSES })
      .notNull()
      .default('ongoing'),
    ...location(),
    ...image('cover'),
    // #203: where to buy tickets, beside `site`.
    ticketUrl: text('ticket_url'),
    // No CHECK: adding one would rebuild the table, and drop its links
    // with it. The actions only accept EVENT_ATTENDANCES.
    attendance: text('attendance', { enum: EVENT_ATTENDANCES })
      .notNull()
      .default('in_person'),
    // #347: where to join online (a stream, a Discord, a jam page).
    onlineUrl: text('online_url'),
    // #203: the edition before this one, linking a series (Stunfest 2025 →
    // Stunfest 2026).
    previousEditionId: text('previous_edition_id').references(
      () => events.id,
      { onDelete: 'set null' }
    ),
    searchText: text('search_text').notNull().default(''),
    deletedAt: time('deleted_at'),
    lastModifiedById: text('last_modified_by_id').references(() => people.id, {
      onDelete: 'set null',
    }),
    ...timestamps(),
  },
  (t) => [
    check('events_status', oneOf(t.status, EVENT_STATUSES)),
    index('events_previous_edition_id').on(t.previousEditionId),
    uniqueIndex('events_slug').on(t.slug),
    index('events_country_code').on(t.countryCode),
    index('events_starts_at').on(t.startsAt),
    index('events_ends_at').on(t.endsAt),
    index('events_deleted_at').on(t.deletedAt),
  ]
);

export const gameOrganizations = sqliteTable(
  'game_organizations',
  {
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    // #40: how the organisation took part in the game.
    role: text('role', { enum: GAME_ORGANIZATION_ROLES })
      .notNull()
      .default('developer'),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    // One row per role, so a studio can be both developer and publisher (#335).
    primaryKey({ columns: [t.gameId, t.organizationId, t.role] }),
    check('game_organizations_role', oneOf(t.role, GAME_ORGANIZATION_ROLES)),
    index('game_organizations_organization_id').on(t.organizationId),
  ]
);

export const gameEvents = sqliteTable(
  'game_events',
  {
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.gameId, t.eventId] }),
    index('game_events_event_id').on(t.eventId),
  ]
);

export const organizationEvents = sqliteTable(
  'organization_events',
  {
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.eventId] }),
    index('organization_events_event_id').on(t.eventId),
  ]
);

export const eventParticipants = sqliteTable(
  'event_participants',
  {
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    joinedAt: time('joined_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.personId] }),
    index('event_participants_person_id').on(t.personId),
  ]
);

export const gameImages = sqliteTable(
  'game_images',
  {
    id: id(),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    width: integer('width'),
    height: integer('height'),
    // The order they're shown in, from 0.
    position: integer('position').notNull().default(0),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index('game_images_game_id').on(t.gameId, t.position)]
);

export const tags = sqliteTable(
  'tags',
  {
    id: id(),
    name: text('name').notNull().unique(),
    ...timestamps(),
  },
  (t) => [check('tags_name_length', sql`length(${t.name}) <= 30`)]
);

// A variant spelling of a tag (#207): entering it attaches the tag instead.
export const tagAliases = sqliteTable('tag_aliases', {
  alias: text('alias').primaryKey(),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: time('created_at')
    .notNull()
    .$defaultFn(() => new Date()),
});

export const gameTags = sqliteTable(
  'game_tags',
  {
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.gameId, t.tagId] }),
    index('game_tags_tag_id').on(t.tagId),
  ]
);

// The steps of a game's life (#332): announced, in beta, released… with
// when, as precisely as it's known. `date` is the start of that period
// (UTC), so they sort; `note` says more ("on Switch", "with Raw Fury").
export const gameMilestones = sqliteTable(
  'game_milestones',
  {
    id: id(),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: GAME_MILESTONE_KINDS }).notNull(),
    date: time('date').notNull(),
    datePrecision: text('date_precision', { enum: DATE_PRECISIONS })
      .notNull()
      .default('month'),
    note: text('note'),
    ...timestamps(),
  },
  (t) => [
    index('game_milestones_game_id').on(t.gameId, t.date),
    check('game_milestones_kind', oneOf(t.kind, GAME_MILESTONE_KINDS)),
    check('game_milestones_date_precision', oneOf(t.datePrecision, DATE_PRECISIONS)),
    check('game_milestones_note_length', sql`length(${t.note}) <= 140`),
  ]
);

// The change log: one row per create, update or delete of a game,
// organisation or event, written by the app with the change (#150).
export const changes = sqliteTable(
  'changes',
  {
    id: id(),
    operation: text('operation', { enum: CHANGE_OPERATIONS }).notNull(),
    tableName: text('table_name').notNull(),
    recordId: text('record_id').notNull(),
    data: text('data', { mode: 'json' }).notNull(),
    authorId: text('author_id').references(() => people.id, {
      onDelete: 'set null',
    }),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    check('changes_operation', oneOf(t.operation, CHANGE_OPERATIONS)),
    index('changes_record').on(t.tableName, t.recordId),
    index('changes_created_at').on(t.createdAt),
  ]
);

// #254: a game's stored IGDB data, out of `games` so a refresh doesn't
// bump the game's updated_at or add to its history.
export const gameIgdb = sqliteTable(
  'game_igdb',
  {
    gameId: text('game_id')
      .primaryKey()
      .references(() => games.id, { onDelete: 'cascade' }),
    // The slug `data` was fetched for; data for another slug is ignored.
    slug: text('slug').notNull(),
    // Null when IGDB has no game for the slug.
    data: text('data', { mode: 'json' }),
    fetchedAt: time('fetched_at'),
    // Set while a refresh runs, so concurrent views start at most one.
    refreshStartedAt: time('refresh_started_at'),
  },
  (t) => [index('game_igdb_fetched_at').on(t.fetchedAt)]
);

// #209: slugs from before a rename, so old URLs redirect to the new one.
export const slugAliases = sqliteTable(
  'slug_aliases',
  {
    // "game", "organization" or "event".
    kind: text('kind').notNull(),
    slug: text('slug').notNull(),
    recordId: text('record_id').notNull(),
    createdAt: time('created_at')
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.kind, t.slug] })]
);

// Small values kept between requests: the IGDB token, Bluesky OAuth state
// and sessions (under prefixed keys).
export const kv = sqliteTable(
  'kv',
  {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    expiresAt: time('expires_at'),
  },
  (t) => [index('kv_expires_at').on(t.expiresAt)]
);

export const peopleRelations = relations(people, ({ many }) => ({
  participations: many(eventParticipants),
  changes: many(changes),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  games: many(gameOrganizations),
  events: many(organizationEvents),
}));

export const gamesRelations = relations(games, ({ many, one }) => ({
  organizations: many(gameOrganizations),
  events: many(gameEvents),
  images: many(gameImages),
  tags: many(gameTags),
  milestones: many(gameMilestones),
  igdb: one(gameIgdb),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  games: many(gameEvents),
  organizations: many(organizationEvents),
  participants: many(eventParticipants),
}));

export const gameOrganizationsRelations = relations(
  gameOrganizations,
  ({ one }) => ({
    game: one(games, {
      fields: [gameOrganizations.gameId],
      references: [games.id],
    }),
    organization: one(organizations, {
      fields: [gameOrganizations.organizationId],
      references: [organizations.id],
    }),
  })
);

export const gameEventsRelations = relations(gameEvents, ({ one }) => ({
  game: one(games, { fields: [gameEvents.gameId], references: [games.id] }),
  event: one(events, { fields: [gameEvents.eventId], references: [events.id] }),
}));

export const organizationEventsRelations = relations(
  organizationEvents,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationEvents.organizationId],
      references: [organizations.id],
    }),
    event: one(events, {
      fields: [organizationEvents.eventId],
      references: [events.id],
    }),
  })
);

export const eventParticipantsRelations = relations(
  eventParticipants,
  ({ one }) => ({
    event: one(events, {
      fields: [eventParticipants.eventId],
      references: [events.id],
    }),
    person: one(people, {
      fields: [eventParticipants.personId],
      references: [people.id],
    }),
  })
);

export const gameImagesRelations = relations(gameImages, ({ one }) => ({
  game: one(games, { fields: [gameImages.gameId], references: [games.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  games: many(gameTags),
  aliases: many(tagAliases),
}));

export const tagAliasesRelations = relations(tagAliases, ({ one }) => ({
  tag: one(tags, { fields: [tagAliases.tagId], references: [tags.id] }),
}));

export const gameTagsRelations = relations(gameTags, ({ one }) => ({
  game: one(games, { fields: [gameTags.gameId], references: [games.id] }),
  tag: one(tags, { fields: [gameTags.tagId], references: [tags.id] }),
}));

export const changesRelations = relations(changes, ({ one }) => ({
  author: one(people, { fields: [changes.authorId], references: [people.id] }),
}));

export const gameMilestonesRelations = relations(gameMilestones, ({ one }) => ({
  game: one(games, { fields: [gameMilestones.gameId], references: [games.id] }),
}));

export const gameIgdbRelations = relations(gameIgdb, ({ one }) => ({
  game: one(games, { fields: [gameIgdb.gameId], references: [games.id] }),
}));
