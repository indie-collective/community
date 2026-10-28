// The private address of a member's own calendar (#342): their ID and a
// signature, so it can't be guessed for someone else, and needs no table.

const encoder = new TextEncoder();

const key = () => {
  const [secret] = process.env.SESSION_SECRET?.split(',').filter(Boolean) ?? [];
  if (!secret) throw new Error('SESSION_SECRET is needed to sign calendar links.');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
};

const base64url = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const signature = async (personId) =>
  base64url(await crypto.subtle.sign('HMAC', await key(), encoder.encode(`calendar:${personId}`))).slice(0, 32);

/** The token in a member's calendar address. */
export const calendarToken = async (personId) => `${personId}.${await signature(personId)}`;

/** The member a token is for, or null when it isn't a valid one. */
export async function personFromCalendarToken(token) {
  const [personId, given, extra] = String(token ?? '').split('.');
  if (!personId || !given || extra !== undefined) return null;
  const expected = await signature(personId);
  // Same length, compared in full.
  let diff = expected.length ^ given.length;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0 ? personId : null;
}
