import { createCookieSessionStorage } from '@react-router/node';

// Comma-separated so the secret can be rotated: the first one signs new
// cookies, the others are still accepted until they expire.
const secrets = process.env.SESSION_SECRET?.split(',').filter(Boolean) ?? [];

if (secrets.length === 0) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET environment variable is needed to sign session cookies.'
    );
  }
  secrets.push('dev-only-session-secret');
}

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 3600,
  },
});

export let { getSession, commitSession, destroySession } = sessionStorage;
