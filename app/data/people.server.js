// People: every read and write sign-in, profiles and the admin users page
// make (#151). The only place that knows how people are stored.
import { count, desc, eq } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { people } from '../db/schema.js';
import computePerson from '../models/person';
import getImageLinks from '../utils/imageLinks.server';
import { createPerson as createPersonWithUsername } from '../utils/username.server';
import { imageColumns } from './images.server';
import * as shape from './shapes.server';

const byId = (id) =>
  db.query.people.findFirst({ where: eq(people.id, id) }).then(shape.person);

/** The person with this email, or null. */
export async function findPersonByEmail(email) {
  return (
    shape.person(
      await db.query.people.findFirst({ where: eq(people.email, email) })
    ) ?? null
  );
}

/** The person signed in with this Discord account, or null. */
export async function findPersonByDiscordId(discordId) {
  return (
    shape.person(
      await db.query.people.findFirst({
        where: eq(people.discordId, discordId),
      })
    ) ?? null
  );
}

/**
 * Creates a person (old field names: `first_name`, `isAdmin`, …), choosing
 * a free username from the one given or their name (see
 * utils/username.server).
 */
export function createPerson(fields) {
  return createPersonWithUsername(
    {
      isUsernameTaken,
      insert: async (username) => {
        const [row] = await db
          .insert(people)
          .values({
            username,
            email: fields.email,
            discordId: fields.discord_id,
            firstName: fields.first_name,
            lastName: fields.last_name,
            about: fields.about,
            avatarUrl: fields.avatar_oauth,
            role: fields.isAdmin ? 'admin' : 'member',
          })
          .returning();
        return shape.person(row);
      },
    },
    fields
  );
}

/** Whether a person with this ID still exists. */
export async function personExists(id) {
  return !!(await db.query.people.findFirst({
    where: eq(people.id, id),
    columns: { id: true },
  }));
}

/** Whether this person is an admin. */
export async function isAdmin(id) {
  const row = await db.query.people.findFirst({
    where: eq(people.id, id),
    columns: { role: true },
  });
  return row?.role === 'admin';
}

/** An avatar's thumbnail URL (`avatar_id` on a person), or null. */
export async function avatarThumbnail(avatarId) {
  return avatarId ? getImageLinks(shape.image(avatarId)).thumbnail_url : null;
}

/** Remembers the picture from the sign-in provider. */
export async function setProviderAvatar(id, url) {
  await db.update(people).set({ avatarUrl: url }).where(eq(people.id, id));
}

/** Grants or removes admin rights. */
export async function setAdmin(id, admin) {
  await db
    .update(people)
    .set({ role: admin ? 'admin' : 'member' })
    .where(eq(people.id, id));
}

/** Sets a person's email. Throws when another person has it. */
export async function setEmail(id, email) {
  await db.update(people).set({ email }).where(eq(people.id, id));
}

/** Whether another person has this username. */
export async function isUsernameTaken(username) {
  return !!(await db.query.people.findFirst({
    where: eq(people.username, username),
    columns: { id: true },
  }));
}

/** A person for their profile page, computed (see models/person). */
export async function getProfile(id) {
  const person = await byId(id);
  return computePerson({
    id: person.id,
    avatar_id: person.avatar_id,
    username: person.username,
    first_name: person.first_name,
    last_name: person.last_name,
    about: person.about,
    avatar: person.avatar,
    discord_id: person.discord_id,
  });
}

/** A person for their profile form, with their avatar's thumbnail URL. */
export async function getProfileForEdit(id) {
  const person = await byId(id);
  return {
    ...person,
    avatar: person.avatar
      ? getImageLinks(person.avatar).thumbnail_url
      : undefined,
  };
}

/**
 * Updates a person's profile; a missing avatar keeps the current one.
 * Throws when the username is taken.
 * @returns the updated person, avatar as `{ url, thumbnail_url }` or null
 */
export async function updateProfile(
  id,
  { avatarId, firstName, lastName, username, about }
) {
  const [row] = await db
    .update(people)
    .set({
      ...(await imageColumns('avatar', avatarId)),
      firstName,
      lastName,
      username,
      about,
    })
    .where(eq(people.id, id))
    .returning();
  const person = shape.person(row);
  return {
    ...person,
    avatar: person.avatar ? getImageLinks(person.avatar) : null,
  };
}

/** Everyone, newest first, computed, for the admin users page. */
export async function listPeople() {
  const rows = await db.query.people.findMany({
    orderBy: desc(people.createdAt),
  });
  return Promise.all(
    rows
      .map(shape.person)
      .map(
        ({
          id,
          created_at,
          username,
          first_name,
          last_name,
          email,
          discord_id,
          isAdmin,
          avatar,
        }) =>
          computePerson({
            id,
            created_at,
            username,
            first_name,
            last_name,
            email,
            discord_id,
            isAdmin,
            avatar,
          })
      )
  );
}

/** How many people there are. */
export async function countPeople() {
  const [{ value }] = await db.select({ value: count() }).from(people);
  return value;
}
