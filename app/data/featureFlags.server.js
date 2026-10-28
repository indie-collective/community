// Feature flags' states (see utils/featureFlags), in the key-value store
// under "flag:<key>": no migration for a new flag.
import { inArray } from 'drizzle-orm';

import { db } from '../db/index.server.js';
import { kv } from '../db/schema.js';
import { FEATURE_FLAGS, flagState, isFlagState, isOnFor } from '../utils/featureFlags';
import { setValue } from './kv.server';

const keyOf = (key) => `flag:${key}`;

/** Every flag's state: `{ opportunities: 'off', … }`. */
export async function flagStates() {
  const rows = await db
    .select()
    .from(kv)
    .where(inArray(kv.key, FEATURE_FLAGS.map((flag) => keyOf(flag.key))));
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  return Object.fromEntries(FEATURE_FLAGS.map((flag) => [flag.key, flagState(flag.key, stored.get(keyOf(flag.key)))]));
}

/** Which flags are on for `currentUser`: `{ opportunities: true, … }`, for the root loader. */
export async function enabledFeatures(currentUser) {
  const states = await flagStates();
  return Object.fromEntries(Object.entries(states).map(([key, state]) => [key, isOnFor(state, currentUser)]));
}

/** Whether one flag is on for `currentUser`. */
export async function isFeatureOn(key, currentUser) {
  return (await enabledFeatures(currentUser))[key] ?? false;
}

/** A 404 unless the flag is on for `currentUser`: for the pages behind it. */
export async function requireFeature(key, currentUser) {
  if (!(await isFeatureOn(key, currentUser))) throw new Response('Not Found', { status: 404 });
}

/** Sets a flag's state; throws on an unknown flag or state. */
export async function setFlagState(key, state) {
  if (!FEATURE_FLAGS.some((flag) => flag.key === key) || !isFlagState(state)) throw new Error('Unknown flag or state');
  await setValue(keyOf(key), state);
}
