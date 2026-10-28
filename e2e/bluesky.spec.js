import { expect, test, ADMIN, MEMBER, signIn } from './helpers';

// #157: Bluesky sign-in. A real sign-in needs a Bluesky account; these check
// what doesn't: the form, the published client metadata, and that a forged
// callback signs nobody in.
test('the sign-in page offers Bluesky', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.getByLabel('Your Bluesky handle')).toHaveAttribute(
    'placeholder',
    'yourname.bsky.social'
  );
  await expect(
    page.getByRole('button', { name: 'Sign in with Bluesky' })
  ).toBeVisible();
});

test('the OAuth client metadata is published', async ({ request, baseURL }) => {
  const metadata = await (
    await request.get('/oauth/client-metadata.json')
  ).json();
  expect(metadata).toMatchObject({
    scope: 'atproto transition:email',
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  });
  // Locally a loopback client, whose callback is on 127.0.0.1.
  expect(metadata.redirect_uris).toEqual([
    `${baseURL.replace('localhost', '127.0.0.1')}/auth/bluesky/callback`,
  ]);
});

test('a forged callback signs nobody in', async ({ page }) => {
  await page.goto(
    '/auth/bluesky/callback?state=forged&code=x&iss=https%3A%2F%2Fbsky.social'
  );
  await expect(page).toHaveURL(/\/signin\?error=/);
  await expect(
    page.getByText('Signing in with Bluesky failed. Please try again.')
  ).toBeVisible();
  const cookies = await page.context().cookies();
  expect(cookies.find(({ name }) => name === '_session')).toBeUndefined();
});

// #158: members link Bluesky from their profile; unlinking needs another
// way to sign in. (Linking itself goes through Bluesky's OAuth.)
test.describe('linking Bluesky', () => {
  const setPerson = async (email, fields) => {
    const { db, people } = await import('./db.js');
    const { eq } = await import('drizzle-orm');
    await db.update(people).set(fields).where(eq(people.email, email));
  };
  const did = `did:plc:e2e${Date.now() % 100000}`;
  test.afterEach(() => setPerson(MEMBER, { did: null, bskyHandle: null }));

  test('the profile offers to link Bluesky', async ({ page }) => {
    await signIn(page, MEMBER);
    await page.goto('/profile');
    await expect(page.getByLabel('Link your Bluesky account')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Link' })).toBeVisible();
  });

  // #159: Bluesky is the only way to sign in, so there's no unlinking.
  test('a linked profile has no unlink', async ({ page }) => {
    await setPerson(MEMBER, { did });
    await signIn(page, MEMBER);
    await page.goto('/profile');
    await expect(page.getByText('Bluesky is linked')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unlink' })).toHaveCount(0);
  });
});

// #161: a linked person's Bluesky handle shows on their profile; their
// avatar among an event's attendees links to their public profile (#341),
// which links their Bluesky.
test('a Bluesky handle shows on the profile and among attendees', async ({
  page,
}) => {
  const { db, events, eventParticipants, people } = await import('./db.js');
  const { and, eq, isNotNull } = await import('drizzle-orm');
  const handle = `member${Date.now() % 100000}.bsky.social`;
  await db
    .update(people)
    .set({ did: `did:plc:${Date.now()}`, bskyHandle: handle })
    .where(eq(people.email, MEMBER));
  const [member] = await db
    .select()
    .from(people)
    .where(eq(people.email, MEMBER));
  const [event] = await db
    .select()
    .from(events)
    .where(isNotNull(events.countryCode))
    .limit(1);
  await db
    .insert(eventParticipants)
    .values({ eventId: event.id, personId: member.id })
    .onConflictDoNothing();
  try {
    await signIn(page, MEMBER);
    await page.goto('/profile');
    await expect(
      page.getByRole('link', { name: `@${handle}` })
    ).toHaveAttribute('href', `https://bsky.app/profile/${handle}`);

    await page.goto(`/event/${event.id}`);
    await page.getByRole('link', { name: `@${member.username}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/people/${member.username}$`));
    await expect(
      page.getByRole('link', { name: `@${handle}` })
    ).toHaveAttribute('href', `https://bsky.app/profile/${handle}`);
  } finally {
    await db
      .delete(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, event.id),
          eq(eventParticipants.personId, member.id)
        )
      );
    await db
      .update(people)
      .set({ did: null, bskyHandle: null })
      .where(eq(people.email, MEMBER));
  }
});

// #159: Discord sign-in is gone. People who signed up with it get their
// Bluesky account linked by an admin, from its handle.
test('sign-in offers Bluesky only, and the header leads there', async ({
  page,
}) => {
  await page.goto('/games');
  await page.getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/signin?prev=%2Fgames');
  await expect(
    page.getByRole('button', { name: 'Sign in with Bluesky' })
  ).toBeVisible();
  await expect(page.getByText(/Discord/)).toHaveCount(0);
  expect((await page.request.get('/auth/discord')).status()).toBe(404);
});

test("an admin links someone's Bluesky account, and an unknown handle is refused", async ({
  page,
}) => {
  await signIn(page, ADMIN);
  await page.goto('/admin/users');
  const handle = page.getByRole('textbox', {
    name: 'Bluesky handle of harness-member',
    exact: true,
  });
  await handle.fill('nobody-here.invalid');
  await handle.press('Enter');
  await expect(
    page.getByText("“nobody-here.invalid” isn't a Bluesky handle we can find.")
  ).toBeVisible();
});

// #160: new games, events and organisations are announced on Bluesky, from
// the IC account. A local stand-in plays its server.
test.describe('announcements on Bluesky', () => {
  const records = [];
  const sessions = [];
  let server;
  test.beforeAll(async () => {
    const { createServer } = await import('node:http');
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const json = (status, data) =>
          res
            .writeHead(status, { 'Content-Type': 'application/json' })
            .end(JSON.stringify(data));
        if (req.url === '/xrpc/com.atproto.server.createSession') {
          sessions.push(JSON.parse(body));
          return json(200, { did: 'did:plc:indieco', accessJwt: 'e2e-token' });
        }
        if (req.url === '/xrpc/com.atproto.repo.createRecord') {
          records.push({
            auth: req.headers.authorization,
            ...JSON.parse(body),
          });
          return json(200, {
            uri: 'at://did:plc:indieco/app.bsky.feed.post/1',
            cid: 'x',
          });
        }
        json(404, {});
      });
    });
    await new Promise((resolve) => server.listen(3196, '127.0.0.1', resolve));
  });
  test.afterAll(() => new Promise((resolve) => server.close(resolve)));

  // #319: not one post per addition, but a summary of the week.
  test('a new game is not posted on its own, but in the weekly summary, with a link card', async ({ page }) => {
    const name = `Announced ${Date.now() % 100000}`;
    await signIn(page, MEMBER);
    const created = await page.request.post('/games/create', {
      form: { name, about: 'A *bold* little game.', site: '', igdb_url: '', tags: '' },
      maxRedirects: 0,
    });
    expect(created.status()).toBe(302);
    await page.waitForTimeout(500);
    expect(records.filter((r) => r.record.text.includes(name))).toHaveLength(0);

    // An admin posts the week's summary from the admin page (as the Monday
    // morning Cron Trigger does).
    await signIn(page, ADMIN);
    await page.goto('/admin/bluesky');
    await expect(page.getByTestId('summary-preview')).toContainText(name);
    await page.getByRole('button', { name: 'Post it now' }).click();
    await expect(page.getByText('Posted.')).toBeVisible();

    await expect.poll(() => records.filter((r) => r.record.text.includes(name)).length).toBe(1);
    const posted = records.find((r) => r.record.text.includes(name));
    expect(sessions.at(-1)).toEqual({ identifier: 'indieco.test', password: 'e2e-app-password' });
    expect(posted.auth).toBe('Bearer e2e-token');
    expect(posted).toMatchObject({ repo: 'did:plc:indieco', collection: 'app.bsky.feed.post' });
    expect(posted.record.text).toMatch(/^New on Indie Collective this week: \d+ games?/);
    expect(posted.record.text).toMatch(/\n\nhttp:\/\/localhost:3100\/\w+$/);
    expect(posted.record.embed.external.title).toMatch(/on Indie Collective$/);

    const { db, games } = await import('./db.js');
    const { eq } = await import('drizzle-orm');
    await db.delete(games).where(eq(games.name, name));
  });
});
