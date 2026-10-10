/**
 * Signing in with an email alone, and editing without Discord membership:
 * for development and the end-to-end tests only. On under `vite dev`; in a
 * build, only with DEV_SIGNIN=true, which production must never set.
 */
export const devSignIn = () =>
  import.meta.env.DEV || process.env.DEV_SIGNIN === 'true';
