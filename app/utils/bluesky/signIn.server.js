// Who a Bluesky sign-in is (#157): the person with that DID, or a new one.
import {
  avatarThumbnail,
  createPerson,
  findPersonByDid,
  findPersonByEmail,
  setProviderAvatar,
} from '../../data/people.server';
import { notifyNewMember } from '../discordNotification.server';

/** A username from a handle: "alice.bsky.social" → "alice". */
export function usernameFromHandle(handle) {
  return (handle ?? '')
    .replace(/\.bsky\.social$/, '')
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

/** Shown when a new Bluesky account's email belongs to someone else. */
export const EMAIL_TAKEN =
  'An account already uses the email of this Bluesky account. Sign in the way you usually do; linking Bluesky to it is coming.';

/**
 * The person for a Bluesky identity (see bluesky/oauth.server identityOf),
 * created on their first sign-in, with their avatar URL refreshed; ready
 * for toSessionUser. Throws EMAIL_TAKEN when a new account's confirmed
 * email belongs to another person.
 */
export async function personForBlueskyIdentity(identity) {
  let person = await findPersonByDid(identity.did);

  if (!person) {
    if (identity.email && (await findPersonByEmail(identity.email))) {
      throw new Error(EMAIL_TAKEN);
    }
    person = await createPerson({
      did: identity.did,
      email: identity.email,
      username: usernameFromHandle(identity.handle),
      first_name: identity.displayName || identity.handle || 'Bluesky user',
      avatar_oauth: identity.avatar,
    });
    await notifyNewMember(person);
  } else if (identity.avatar && person.avatar_oauth !== identity.avatar) {
    await setProviderAvatar(person.id, identity.avatar);
  }

  return {
    ...person,
    avatar: person.avatar_id
      ? await avatarThumbnail(person.avatar_id)
      : identity.avatar,
  };
}
