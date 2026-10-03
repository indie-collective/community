/**
 * The user as stored in the session cookie and returned by
 * `isAuthenticated()`.
 *
 * The cookie is signed, not encrypted, so whoever holds it can read it, and
 * the root loader sends it to the page. Keep it to what the app reads:
 * never credentials, provider ids or profile text (#180). Pages that need
 * more load the person from the database.
 *
 * @typedef {object} SessionUser
 * @property {string} id
 * @property {string} username
 * @property {string} first_name
 * @property {string | null} email - checked by `isAuthenticated()`, shown on /welcome
 * @property {boolean} isAdmin
 * @property {string | null} avatar - the avatar's thumbnail URL
 * @property {boolean} [isGuildMember] - set by Discord sign-in, shown on /welcome
 */

/**
 * Builds the session user from a person row, an authentication strategy's
 * result, or a session written before the user was trimmed.
 *
 * @returns {SessionUser}
 */
export default function toSessionUser(user) {
  if (!user) return user;

  const { id, username, first_name, email, isAdmin, avatar, isGuildMember } = user;

  return {
    id,
    username,
    first_name,
    email,
    isAdmin: Boolean(isAdmin),
    avatar: (typeof avatar === 'string' ? avatar : avatar?.thumbnail_url) ?? null,
    ...(isGuildMember !== undefined && { isGuildMember }),
  };
}
