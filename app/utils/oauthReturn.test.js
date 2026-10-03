import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'react-router';

const authenticate = vi.fn();
vi.mock('./auth.server', () => ({ authenticator: { authenticate: (...args) => authenticate(...args) } }));

const { action } = await import('../routes/auth/$provider');
const { loader: callback } = await import('../routes/auth/$provider.callback');

// The cookie header a browser would send back from a response's Set-Cookie.
const cookiesFrom = (response) =>
  response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ');

const thrown = async (promise) => {
  try {
    await promise;
  } catch (response) {
    return response;
  }
  throw new Error('expected a thrown response');
};

describe('OAuth sign-in', () => {
  beforeEach(() => authenticate.mockReset());

  // #178: prev had to survive the round-trip to the provider.
  it('returns to the page that required sign-in', async () => {
    authenticate.mockImplementationOnce(() => {
      throw redirect('https://provider.example/authorize');
    });
    const toProvider = await thrown(
      action({
        request: new Request('http://localhost/auth/discord', { method: 'POST', body: new URLSearchParams({ prev: '/orgs/create' }) }),
        params: { provider: 'discord' },
      })
    );
    expect(toProvider.headers.get('location')).toBe('https://provider.example/authorize');

    authenticate.mockResolvedValueOnce({ id: 'p1', username: 'member', email: 'p1@indieco.test' });
    const back = await callback({
      request: new Request('http://localhost/auth/discord/callback?code=x', { headers: { cookie: cookiesFrom(toProvider) } }),
      params: { provider: 'discord' },
    });
    expect(back.headers.get('location')).toBe('/orgs/create');
  });

  it('ignores an off-site prev', async () => {
    authenticate.mockImplementationOnce(() => {
      throw redirect('https://provider.example/authorize');
    });
    const toProvider = await thrown(
      action({
        request: new Request('http://localhost/auth/discord', { method: 'POST', body: new URLSearchParams({ prev: '//evil.example' }) }),
        params: { provider: 'discord' },
      })
    );
    authenticate.mockResolvedValueOnce({ id: 'p1', email: 'p1@indieco.test' });
    const back = await callback({
      request: new Request('http://localhost/auth/discord/callback?code=x', { headers: { cookie: cookiesFrom(toProvider) } }),
      params: { provider: 'discord' },
    });
    expect(back.headers.get('location')).toBe('/');
  });
});
