import { eq } from 'drizzle-orm';

import { db, people } from './db.js';
import { expect, test, MEMBER } from './helpers';

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
  const paths = [...new Set(events.match(/\/event\/[a-z0-9-]+/g))].slice(0, 5);
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

// #341: public profiles show what members chose to show, nothing private.
test('public profiles do not expose private fields', async ({ request }) => {
  const [member] = await db.select({ username: people.username }).from(people).where(eq(people.email, MEMBER));
  const path = `/people/${member.username}`;
  const response = await request.get(path);
  expect(response.status()).toBe(200);
  expectNoPrivateFields(await response.text(), path);
});
