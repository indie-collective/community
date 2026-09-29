import { beforeEach, describe, expect, it, vi } from 'vitest';

const findUnique = vi.fn();
vi.mock('./db.server', () => ({ db: { person: { findUnique: (...a) => findUnique(...a) } } }));

const { default: isAuthenticated } = await import('./isAuthenticated.server');
const { commitSession, getSession } = await import('./session.server');

const requestAs = async (user, path = '/profile') => {
  const headers = {};
  if (user) {
    const session = await getSession();
    session.set('user', user);
    headers.cookie = (await commitSession(session)).split(';')[0];
  }
  return new Request(`http://localhost${path}`, { headers });
};

const redirectOf = async (promise) => {
  try {
    await promise;
  } catch (thrown) {
    return thrown.headers.get('location');
  }
  throw new Error('expected a redirect');
};

describe('isAuthenticated', () => {
  beforeEach(() => findUnique.mockReset().mockResolvedValue({ id: 'p1' }));

  it('returns null for anonymous requests when not required', async () => {
    expect(await isAuthenticated(await requestAs(null))).toBeNull();
  });

  // #141: `required` used to fail open, returning null instead of redirecting.
  it('redirects anonymous requests to sign-in, remembering the page, when required', async () => {
    expect(await redirectOf(isAuthenticated(await requestAs(null), true))).toBe(
      '/signin?prev=/profile'
    );
  });

  it('returns the session user when they still exist', async () => {
    const user = { id: 'p1', email: 'p1@indieco.test' };
    expect(await isAuthenticated(await requestAs(user))).toEqual(user);
  });

  it('signs out a session whose user was deleted', async () => {
    findUnique.mockResolvedValue(null);
    const request = await requestAs({ id: 'gone', email: 'gone@indieco.test' });
    expect(await redirectOf(isAuthenticated(request))).toBe('/signin?prev=/profile');
  });

  it('sends users without an email to /welcome, except on /welcome itself', async () => {
    const user = { id: 'p1', email: null };
    expect(await redirectOf(isAuthenticated(await requestAs(user, '/games')))).toBe('/welcome');
    expect(await isAuthenticated(await requestAs(user, '/welcome'))).toEqual(user);
  });
});
