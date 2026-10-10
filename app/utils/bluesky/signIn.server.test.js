import { beforeEach, describe, expect, it, vi } from 'vitest';

const people = vi.hoisted(() => ({
  findPersonByDid: vi.fn(),
  findPersonByEmail: vi.fn(),
  createPerson: vi.fn(async (fields) => ({ id: 'new', ...fields })),
  setProviderAvatar: vi.fn(),
  avatarThumbnail: vi.fn(async (key) => `thumb:${key}`),
}));
vi.mock('../../data/people.server', () => people);
vi.mock('../discordNotification.server', () => ({ notifyNewMember: vi.fn() }));

const { EMAIL_TAKEN, personForBlueskyIdentity, usernameFromHandle } = await import('./signIn.server');

const identity = {
  did: 'did:plc:alice',
  handle: 'alice.bsky.social',
  email: 'alice@example.test',
  displayName: 'Alice',
  avatar: 'https://cdn.bsky.app/alice.jpg',
};

describe('usernameFromHandle', () => {
  it.each([
    ['alice.bsky.social', 'alice'],
    ['pfrazee.com', 'pfrazee'],
    ['Jay.Bsky.Team', 'jay'],
    ['weird_name!.bsky.social', 'weird_name'],
    [null, ''],
  ])('%s → %j', (handle, username) => {
    expect(usernameFromHandle(handle)).toBe(username);
  });
});

describe('personForBlueskyIdentity', () => {
  beforeEach(() => {
    for (const fn of Object.values(people)) fn.mockClear();
    people.findPersonByDid.mockResolvedValue(null);
    people.findPersonByEmail.mockResolvedValue(null);
  });

  it('creates a person on the first sign-in', async () => {
    const person = await personForBlueskyIdentity(identity);
    expect(people.createPerson).toHaveBeenCalledWith({
      did: 'did:plc:alice',
      email: 'alice@example.test',
      username: 'alice',
      first_name: 'Alice',
      avatar_oauth: 'https://cdn.bsky.app/alice.jpg',
    });
    expect(person).toMatchObject({ id: 'new', avatar: 'https://cdn.bsky.app/alice.jpg' });
  });

  it('finds the person by DID afterwards, refreshing the avatar', async () => {
    people.findPersonByDid.mockResolvedValue({ id: 'p1', avatar_oauth: 'old.jpg', avatar_id: null });
    const person = await personForBlueskyIdentity(identity);
    expect(people.createPerson).not.toHaveBeenCalled();
    expect(people.setProviderAvatar).toHaveBeenCalledWith('p1', identity.avatar);
    expect(person.id).toBe('p1');
  });

  it('prefers an uploaded avatar', async () => {
    people.findPersonByDid.mockResolvedValue({ id: 'p1', avatar_oauth: identity.avatar, avatar_id: 'mine.png' });
    expect((await personForBlueskyIdentity(identity)).avatar).toBe('thumb:mine.png');
  });

  it("refuses a new account whose email is someone else's", async () => {
    people.findPersonByEmail.mockResolvedValue({ id: 'p2' });
    await expect(personForBlueskyIdentity(identity)).rejects.toThrow(EMAIL_TAKEN);
    expect(people.createPerson).not.toHaveBeenCalled();
  });

  it('creates a person without an email when none is confirmed', async () => {
    await personForBlueskyIdentity({ ...identity, email: null, displayName: null });
    expect(people.createPerson).toHaveBeenCalledWith(
      expect.objectContaining({ email: null, first_name: 'alice.bsky.social' })
    );
  });
});
