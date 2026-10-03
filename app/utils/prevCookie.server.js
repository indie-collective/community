import { createCookie } from 'react-router';

/**
 * Where to return after an OAuth sign-in. Set when the user leaves for the
 * provider, read and cleared on the callback (#178). Short-lived, and only
 * ever read through safeRedirectPath.
 */
export const prevCookie = createCookie('_prev', {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 10 * 60,
});
