// Adding a record from a picker when it isn't found (#374): a studio,
// association or game created with just its name, then linked by the
// picker's action, which sends the member to its edit page to fill it in.
// Created through the data modules, so the change log, rate limit and
// moderation alerts apply as for any other.
import { redirect } from 'react-router';

import { ORGANIZATION_TYPES } from '../db/schema.js';
import { createGame } from '../data/games.server';
import { createOrganization } from '../data/organizations.server';
import { notifyDiscord } from './discordNotification.server';
import getOrigin from './origin.server';
import { gamePath, orgPath } from './slug';

/**
 * The record a picker's action links: the chosen one (`id`), or a new one
 * from `name` (and, for organisations, `type`). `created` is the new
 * record's page, so the action can send the member to edit it.
 *
 * @param {'organization' | 'game'} kind
 * @returns {Promise<{ id: string, created: string | null }>}
 */
export async function pickedOrCreated(kind, data, { request, currentUser }) {
  const id = data.get('id');
  if (id) return { id, created: null };

  const name = data.get('name')?.trim();
  if (!name) throw new Response('Bad Request', { status: 400 });

  const record =
    kind === 'game'
      ? await createGame({ name, authorId: currentUser.id })
      : await createOrganizationOfType(name, data.get('type'), currentUser.id);
  const page = kind === 'game' ? gamePath(record) : orgPath(record);
  await notifyDiscord(
    `${currentUser.username} added ${kind === 'game' ? 'game' : data.get('type')} "${name}" from a picker at ${new Date().toISOString()} - ${getOrigin(request)}${page}`
  );
  return { id: record.id, created: page };
}

async function createOrganizationOfType(name, type, authorId) {
  if (!ORGANIZATION_TYPES.includes(type)) {
    throw new Response('Bad Request', { status: 400 });
  }
  return createOrganization({ name, type, authorId });
}

/**
 * Where an action goes after linking: the new record's edit page, coming
 * back to `back` (the page the picker was on) once it's saved; nowhere
 * when nothing was created.
 */
export const afterLinking = ({ created }, back) =>
  created
    ? redirect(`${created}/edit?return=${encodeURIComponent(back)}`)
    : null;
