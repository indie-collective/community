import { beforeEach, describe, expect, it, vi } from 'vitest';

const personExists = vi.fn();
vi.mock('../data/people.server', () => ({ personExists: (...a) => personExists(...a) }));

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
  beforeEach(() => personExists.mockReset().mockResolvedValue(true));

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
    expect(await isAuthenticated(await requestAs(user))).toMatchObject(user);
  });

  // #180: cookies written before the session user was trimmed hold the whole
  // person row; they stay valid but are read back as the minimal shape.
  it('reads a legacy full-row cookie back as the minimal session user', async () => {
    const legacy = {
      id: 'p1',
      username: 'member',
      first_name: 'Member',
      last_name: 'Walker',
      about: 'Hi',
      email: 'p1@indieco.test',
      isAdmin: true,
      password_hash: '$2a$06$not-a-real-hash',
      discord_id: '123',
      avatar: 'https://cdn.test/thumb_a.png',
    };
    expect(await isAuthenticated(await requestAs(legacy))).toEqual({
      id: 'p1',
      username: 'member',
      first_name: 'Member',
      email: 'p1@indieco.test',
      isAdmin: true,
      avatar: 'https://cdn.test/thumb_a.png',
    });
  });

  it('signs out a session whose user was deleted', async () => {
    personExists.mockResolvedValue(false);
    const request = await requestAs({ id: 'gone', email: 'gone@indieco.test' });
    expect(await redirectOf(isAuthenticated(request))).toBe('/signin?prev=/profile');
  });

  it('sends users without an email to /welcome, except on /welcome itself', async () => {
    const user = { id: 'p1', email: null };
    expect(await redirectOf(isAuthenticated(await requestAs(user, '/games')))).toBe('/welcome');
    expect(await isAuthenticated(await requestAs(user, '/welcome'))).toMatchObject(user);
  });
});
