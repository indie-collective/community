import { PrismaClient } from '@prisma/client';

import { expect, test, MEMBER, signIn } from './helpers';

const db = new PrismaClient();

// Fields of a `person` row that must never reach a page's loader data.
// Loader data is serialised into the HTML, so anything a loader returns is
// readable by anyone who can open the page.
const PRIVATE_FIELDS = ['password_hash', 'email', 'discord_id', 'github_id', 'steam_id', 'last_name', 'isAdmin'];
const EMAIL = /[\w.+-]+@[\w-]+\.[A-Za-z]{2,}/;

// Reports field names only, so a failure doesn't print the leaked values.
// Loader data is streamed as an escaped string, so its keys appear as
// \"field\" (which also keeps CSS like input[type="email"] from matching).
function expectNoPrivateFields(html, path) {
  const leaked = PRIVATE_FIELDS.filter((field) => html.includes(`\\"${field}\\"`));
  expect(leaked, `private fields in ${path}`).toEqual([]);
  expect(EMAIL.test(html), `email address in ${path}`).toBe(false);
}

test('event pages do not expose attendees’ private fields', async ({ request }) => {
  const events = await (await request.get('/events')).text();
  const paths = [...new Set(events.match(/\/event\/[0-9a-f-]{36}/g))].slice(0, 5);
  expect(paths.length).toBeGreaterThan(0);

  let attendees = 0;
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    attendees += (html.match(/title="@/g) ?? []).length;
    expectNoPrivateFields(html, path);
  }
  // The seed gives events participants; without any, this test proves nothing.
  expect(attendees).toBeGreaterThan(0);
});

test('change history does not expose authors’ private fields', async ({ page, request }) => {
  // Change rows are written by database triggers, which a database set up
  // without migrations lacks, so insert one directly, authored by the member.
  const studios = await (await request.get('/studios')).text();
  const orgPath = studios.match(/\/org\/[0-9a-f-]{36}/)[0];
  const member = await db.person.findUnique({ where: { email: MEMBER }, select: { id: true } });
  const change = await db.change.create({
    data: {
      operation: 'update',
      table_name: 'entity',
      record_id: orgPath.split('/').pop(),
      data: {},
      author_id: member.id,
    },
  });

  try {
    await signIn(page, MEMBER);
    await page.goto(`${orgPath}/changes`);

    // Signed in, the page also carries the visitor's own session user (#180),
    // so check this route's loader data rather than the whole HTML.
    const authors = await page.evaluate(() => {
      const { loaderData } = window.__reactRouterDataRouter.state;
      const id = Object.keys(loaderData).find((key) => key.endsWith('org.$id.changes'));
      return loaderData[id].changes.map(({ author }) => author);
    });
    // Compare key names only, so a failure doesn't print the leaked values.
    const keys = authors.filter(Boolean).map((author) => Object.keys(author));
    expect(keys.length).toBeGreaterThan(0);
    for (const authorKeys of keys) expect(authorKeys).toEqual(['username']);
    expect(authors.some((author) => author?.username === 'harness-member')).toBe(true);
  } finally {
    await db.change.delete({ where: { id: change.id } });
  }
});

test.afterAll(() => db.$disconnect());
