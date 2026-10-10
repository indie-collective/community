#!/usr/bin/env node
/**
 * Fills a local D1 with made-up data for development and the end-to-end
 * tests: tags, two known accounts, people, games, events and organisations.
 *
 * Usage (on a migrated database, see the README):
 *   node scripts/seed.mjs
 *   D1_PERSIST_PATH=… node scripts/seed.mjs   # another local database
 */
import { faker } from '@faker-js/faker';

import { closeDb, db } from '../app/db/index.server.js';
import {
  eventParticipants,
  events,
  gameImages,
  gameOrganizations,
  games,
  gameTags,
  organizationEvents,
  organizations,
  people,
  tags,
} from '../app/db/schema.js';
import { searchText } from '../app/db/searchText.js';

const in2025 = () =>
  faker.date.between({
    from: '2025-01-01T00:00:00Z',
    to: '2025-12-31T23:59:59Z',
  });

// D1 runs a batch as one transaction; smaller ones keep each request light.
async function insertAll(table, rows) {
  for (let i = 0; i < rows.length; i += 50) {
    await db.batch(
      rows.slice(i, i + 50).map((row) => db.insert(table).values(row))
    );
  }
}

console.log('Seeding the database...');

const tagRows = [
  'Indie',
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Puzzle',
  'Platformer',
  'Singleplayer',
  'Multiplayer',
  'Co-op',
].map((name) => ({ id: crypto.randomUUID(), name }));
await db.insert(tags).values(tagRows).onConflictDoNothing();

// Known local-only accounts for exercising authenticated flows. In
// development, signin's form strategy only checks the email, so they need
// no password.
await insertAll(
  people,
  [
    { username: 'harness-admin', role: 'admin' },
    { username: 'harness-member', role: 'member' },
  ].map(({ username, role }) => ({
    username,
    email: `${username}@indieco.test`,
    firstName: username,
    role,
  }))
);

const personRows = Array.from({ length: 10 }, () => ({
  id: crypto.randomUUID(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  // Usernames are at most 30 characters; faker occasionally exceeds that.
  username: faker.internet.username().slice(0, 30),
  about: faker.lorem.paragraph(),
}));
await insertAll(people, personRows);

// Places, shared by organisations and events as copied columns.
const places = Array.from({ length: 50 }, () => ({
  city: faker.location.city(),
  // Within ±80°: Web Mercator maps (pigeon-maps) stop near ±85°, so a place
  // closer to a pole renders no map tiles, which made tests flaky.
  latitude: faker.location.latitude({ min: -80, max: 80 }),
  longitude: faker.location.longitude(),
  street: faker.location.streetAddress(),
  countryCode: faker.location.countryCode(),
  region: faker.location.state(),
}));

const gameRows = Array.from({ length: 100 }, (_, i) => {
  const name = faker.commerce.productName();
  const about = faker.lorem.paragraph();
  const createdAt = i < 50 ? in2025() : faker.date.past(); // Half in 2025.
  return {
    id: crypto.randomUUID(),
    name,
    about,
    site: faker.internet.url(),
    searchText: searchText(name, about),
    createdAt,
    updatedAt: createdAt,
  };
});
await insertAll(games, gameRows);
await insertAll(
  gameTags,
  gameRows.flatMap((game) =>
    faker.helpers.arrayElements(tagRows, 3).map((tag) => ({
      gameId: game.id,
      tagId: tag.id,
      createdAt: game.createdAt,
    }))
  )
);
await insertAll(
  gameImages,
  gameRows.flatMap((game) =>
    Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, (_, j) => ({
      gameId: game.id,
      key: `https://picsum.photos/seed/${game.id}-${j}/800/450`,
      width: 800,
      height: 450,
      position: j,
      createdAt: game.createdAt,
    }))
  )
);

const eventRows = Array.from({ length: 50 }, (_, i) => {
  const name = faker.company.name() + ' Conference';
  const about = faker.lorem.paragraph();
  const recent = i < 40; // Most in 2025.
  const startsAt = recent ? in2025() : faker.date.future();
  const id = crypto.randomUUID();
  return {
    id,
    name,
    about,
    site: faker.internet.url(),
    startsAt,
    endsAt: new Date(
      startsAt.getTime() + (Math.random() * 3 + 1) * 24 * 60 * 60 * 1000
    ),
    ...faker.helpers.arrayElement(places),
    coverKey: `https://picsum.photos/seed/event-${id}/1200/600`,
    coverWidth: 1200,
    coverHeight: 600,
    searchText: searchText(name, about),
    createdAt: recent ? startsAt : faker.date.past(),
  };
});
await insertAll(events, eventRows);

const organizationRows = Array.from({ length: 40 }, (_, i) => {
  const name = faker.company.name();
  const about = faker.lorem.paragraph();
  const createdAt = i < 30 ? in2025() : faker.date.past();
  const id = crypto.randomUUID();
  return {
    id,
    name,
    about,
    site: faker.internet.url(),
    type: faker.helpers.arrayElement(['studio', 'association']),
    ...faker.helpers.arrayElement(places),
    logoKey: `https://picsum.photos/seed/entity-${id}/400/400`,
    logoWidth: 400,
    logoHeight: 400,
    searchText: searchText(name, about),
    createdAt,
    updatedAt: createdAt,
  };
});
await insertAll(organizations, organizationRows);

await insertAll(
  eventParticipants,
  eventRows.map((event) => ({
    eventId: event.id,
    personId: faker.helpers.arrayElement(personRows).id,
  }))
);
await insertAll(
  gameOrganizations,
  gameRows.map((game) => ({
    gameId: game.id,
    organizationId: faker.helpers.arrayElement(organizationRows).id,
  }))
);
await insertAll(
  organizationEvents,
  eventRows.map((event) => ({
    eventId: event.id,
    organizationId: faker.helpers.arrayElement(organizationRows).id,
  }))
);

await closeDb();
console.log('Seeding complete.');
