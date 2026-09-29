import { afterEach, describe, expect, it, vi } from 'vitest';

const load = async () => {
  vi.resetModules();
  return import('./session.server');
};

// #164: cookies were signed with a hardcoded secret committed to the repo.
describe('session cookie secret', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('refuses to start in production without SESSION_SECRET', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    await expect(load()).rejects.toThrow('SESSION_SECRET');
  });

  it('signs with the first secret and still reads cookies signed with the others', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'old-secret');
    const before = await load();
    const session = await before.getSession();
    session.set('user', { id: 'p1' });
    const oldCookie = (await before.commitSession(session)).split(';')[0];

    vi.stubEnv('SESSION_SECRET', 'new-secret,old-secret');
    const after = await load();
    expect((await after.getSession(oldCookie)).get('user')).toEqual({ id: 'p1' });
  });

  it('rejects cookies signed with an unknown secret', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'attacker-guess');
    const forger = await load();
    const session = await forger.getSession();
    session.set('user', { id: 'admin', isAdmin: true });
    const forged = (await forger.commitSession(session)).split(';')[0];

    vi.stubEnv('SESSION_SECRET', 'real-secret');
    const app = await load();
    expect((await app.getSession(forged)).get('user')).toBeUndefined();
  });
});
