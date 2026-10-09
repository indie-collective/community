// People: every read and write sign-in, profiles and the admin users page
// make (#151, part 2). The only place that knows how people are stored;
// the D1 port reimplements these functions with the same results.
import { db } from '../utils/db.server';
import computePerson from '../models/person';
import getImageLinks from '../utils/imageLinks.server';
import { createPerson as createPersonWithUsername } from '../utils/username.server';

/** The person with this email, or null. */
export function findPersonByEmail(email) {
  return db.person.findUnique({ where: { email } });
}

/** The person signed in with this Discord account, or null. */
export function findPersonByDiscordId(discordId) {
  return db.person.findUnique({ where: { discord_id: discordId } });
}

/**
 * Creates a person, choosing a free username from the one given or their
 * name (see utils/username.server).
 */
export function createPerson(fields) {
  return createPersonWithUsername(db, fields);
}

/** Whether a person with this ID still exists. */
export async function personExists(id) {
  return !!(await db.person.findUnique({
    where: { id },
    select: { id: true },
  }));
}

/** Whether this person is an admin. */
export async function isAdmin(id) {
  return !!(
    await db.person.findUnique({ where: { id }, select: { isAdmin: true } })
  )?.isAdmin;
}

/** An uploaded avatar's thumbnail URL, or null. */
export async function avatarThumbnail(avatarId) {
  if (!avatarId) return null;
  const image = await db.image.findFirst({ where: { id: avatarId } });
  return image ? getImageLinks(image).thumbnail_url : null;
}

/** Remembers the picture from the sign-in provider. */
export async function setProviderAvatar(id, url) {
  await db.person.update({ where: { id }, data: { avatar_oauth: url } });
}

/** Grants or removes admin rights. */
export async function setAdmin(id, admin) {
  await db.person.update({ where: { id }, data: { isAdmin: admin } });
}

/** Sets a person's email. Throws when another person has it. */
export async function setEmail(id, email) {
  await db.person.update({ where: { id }, data: { email } });
}

/** Whether another person has this username. */
export async function isUsernameTaken(username) {
  return !!(await db.person.findUnique({ where: { username } }));
}

/** A person for their profile page, computed (see models/person). */
export async function getProfile(id) {
  const person = await db.person.findUnique({
    where: { id },
    select: {
      id: true,
      avatar_id: true,
      username: true,
      first_name: true,
      last_name: true,
      about: true,
      avatar: true,
      discord_id: true,
    },
  });
  return computePerson(person);
}

/** A person for their profile form, with their avatar's thumbnail URL. */
export async function getProfileForEdit(id) {
  const person = await db.person.findUnique({
    where: { id },
    include: { avatar: true },
  });
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
  const person = await db.person.update({
    where: { id },
    data: {
      avatar_id: avatarId || undefined,
      first_name: firstName,
      last_name: lastName,
      username,
      about,
    },
    include: { avatar: true },
  });
  return {
    ...person,
    avatar: person.avatar ? getImageLinks(person.avatar) : null,
  };
}

/** Everyone, newest first, computed, for the admin users page. */
export async function listPeople() {
  const people = await db.person.findMany({
    select: {
      id: true,
      created_at: true,
      username: true,
      first_name: true,
      last_name: true,
      email: true,
      discord_id: true,
      isAdmin: true,
      avatar: true,
    },
    orderBy: { created_at: 'desc' },
  });
  return Promise.all(people.map(computePerson));
}

/** How many people there are. */
export function countPeople() {
  return db.person.count();
}
