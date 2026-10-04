import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notifyDiscord, notifyNewMember } from './discordNotification.server';

describe('Discord notifications', () => {
  const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('DISCORD_NOTIFICATION_WEBHOOK', 'https://discord.test/hook');
    vi.stubEnv('BASE_URL', 'https://community.test');
  });
  afterEach(() => {
    fetchMock.mockClear();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  const sent = () => JSON.parse(fetchMock.mock.calls.at(-1)[1].body);

  // Names are typed by people: "@everyone" must not ping the server.
  it('never lets content mention anyone', async () => {
    await notifyDiscord('@everyone look');
    expect(sent().allowed_mentions).toEqual({ parse: [] });
  });

  // #34
  it('announces a new member with their username, name and the members page', async () => {
    await notifyNewMember({ username: 'jdoe', first_name: 'Jane', email: 'jane@example.test' });
    expect(sent().content).toBe('👋 New member: **@jdoe** (Jane) joined Community. https://community.test/admin/users');
    expect(sent().content).not.toContain('jane@example.test');
  });

  it('leaves out the link without BASE_URL, and stays quiet without a webhook', async () => {
    vi.stubEnv('BASE_URL', '');
    await notifyNewMember({ username: 'jdoe', first_name: 'Jane' });
    expect(sent().content).toBe('👋 New member: **@jdoe** (Jane) joined Community.');

    vi.stubEnv('DISCORD_NOTIFICATION_WEBHOOK', '');
    fetchMock.mockClear();
    await notifyNewMember({ username: 'jdoe', first_name: 'Jane' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
