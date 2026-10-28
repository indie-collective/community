import { eq } from 'drizzle-orm';

import { db, eventParticipants, events, organizationEvents, organizations, people, searchText, retryBusy } from './db.js';
import { expect, test, MEMBER, signIn } from './helpers';
import { eventSlug } from '../app/utils/slug.js';

// #342: calendars to subscribe to, "Add to calendar", and Atom feeds.

const unfold = (text) => text.replace(/\r\n /g, '');

async function insertEvent(name, values = {}) {
  const startsAt = new Date(Date.now() + 5 * 86400000);
  const [event] = await db
    .insert(events)
    .values({
      name,
      slug: eventSlug(name, startsAt),
      searchText: searchText(name),
      startsAt,
      endsAt: new Date(startsAt.getTime() + 7200000),
      city: 'Lyon',
      countryCode: 'FR',
      latitude: 45.76,
      longitude: 4.84,
      ...values,
    })
    .returning();
  return event;
}

test('the events calendar, a country one and an organisation one list their events', async ({ request }) => {
  const id = Date.now() % 100000;
  const lyon = await insertEvent(`Calendar Lyon ${id}`);
  const tokyo = await insertEvent(`Calendar Tokyo ${id}`, { city: 'Tokyo', countryCode: 'JP', status: 'canceled' });
  const [host] = await db.insert(organizations).values({ name: `Calendar Host ${id}`, type: 'association' }).returning();
  await db.insert(organizationEvents).values({ organizationId: host.id, eventId: lyon.id });
  try {
    const all = await request.get('/calendar.ics');
    expect(all.headers()['content-type']).toBe('text/calendar; charset=utf-8');
    const text = unfold(await all.text());
    expect(text).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(text).toContain(`UID:${lyon.id}@`);
    expect(text).toContain(`SUMMARY:Calendar Lyon ${id}`);
    // Canceled events stay, marked so.
    expect(text).toMatch(new RegExp(`SUMMARY:Calendar Tokyo ${id}[\\s\\S]*?STATUS:CANCELLED`));

    const france = unfold(await (await request.get('/country/fr/calendar.ics')).text());
    expect(france).toContain(`Calendar Lyon ${id}`);
    expect(france).not.toContain(`Calendar Tokyo ${id}`);

    const hosted = unfold(await (await request.get(`/org/${host.id}/calendar.ics`)).text());
    expect(hosted).toContain(`X-WR-CALNAME:Calendar Host ${id}: events`);
    expect(hosted).toContain(`Calendar Lyon ${id}`);
    expect(hosted).not.toContain(`Calendar Tokyo ${id}`);

    expect((await request.get('/country/zz/calendar.ics')).status()).toBe(404);
  } finally {
    await retryBusy(() => db.delete(events).where(eq(events.id, lyon.id)));
    await retryBusy(() => db.delete(events).where(eq(events.id, tokyo.id)));
    await retryBusy(() => db.delete(organizations).where(eq(organizations.id, host.id)));
  }
});

test('an upcoming event can be added to a calendar', async ({ page }) => {
  const event = await insertEvent(`Add Me ${Date.now() % 100000}`);
  try {
    await page.goto(`/event/${event.slug}`);
    await page.getByRole('button', { name: 'Add to calendar' }).click();
    const file = page.getByRole('menuitem', { name: /\.ics/ });
    await expect(file).toHaveAttribute('href', `/event/${event.slug}/calendar.ics`);
    const google = new URL(await page.getByRole('menuitem', { name: 'Google Calendar' }).getAttribute('href'));
    expect(google.searchParams.get('text')).toBe(event.name);

    const response = await page.request.get(`/event/${event.slug}/calendar.ics`);
    expect(response.headers()['content-disposition']).toBe(`attachment; filename="${event.slug}.ics"`);
    expect(unfold(await response.text())).toContain(`SUMMARY:${event.name}`);
  } finally {
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
  }
});

test("a member's private calendar has the events they're going to", async ({ page }) => {
  const event = await insertEvent(`Going To ${Date.now() % 100000}`);
  const other = await insertEvent(`Not Going ${Date.now() % 100000}`);
  await signIn(page, MEMBER);
  const [member] = await db.select().from(people).where(eq(people.email, MEMBER));
  await db.insert(eventParticipants).values({ eventId: event.id, personId: member.id });
  try {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Add to my calendar' }).click();
    const webcal = await page.getByRole('menuitem', { name: /Calendar app/ }).getAttribute('href');
    expect(webcal).toMatch(/^webcal:\/\/[^/]+\/my-calendar\/.+/);
    const path = new URL(webcal.replace(/^webcal:/, 'http:')).pathname;

    // Signed out, the address still works: calendar apps don't sign in.
    const text = unfold(await (await page.request.get(path, { headers: { cookie: '' } })).text());
    expect(text).toContain(`SUMMARY:${event.name}`);
    expect(text).not.toContain(other.name);
    // Someone else's ID with this signature is refused.
    const [, sig] = path.split('/').pop().split('.');
    expect((await page.request.get(`/my-calendar/${other.id}.${sig}`)).status()).toBe(404);
  } finally {
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
    await retryBusy(() => db.delete(events).where(eq(events.id, other.id)));
  }
});

test('Atom feeds list what was added, newest first, and by country', async ({ page, request }) => {
  const event = await insertEvent(`Feed Event ${Date.now() % 100000}`);
  try {
    const all = await request.get('/feed.xml');
    expect(all.headers()['content-type']).toBe('application/atom+xml; charset=utf-8');
    const xml = await all.text();
    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(xml.indexOf(`<title>${event.name}</title>`)).toBeGreaterThan(0);

    const japan = await (await request.get('/events/feed.xml?country=JP')).text();
    expect(japan).toContain('<title>New events in Japan</title>');
    expect(japan).not.toContain(event.name);
    expect(await (await request.get('/games/feed.xml')).text()).toContain('<title>New games</title>');

    // Feed readers find them from any page.
    await page.goto('/about');
    await expect(page.locator('link[rel="alternate"][type="application/atom+xml"][href="/feed.xml"]')).toHaveCount(1);
  } finally {
    await retryBusy(() => db.delete(events).where(eq(events.id, event.id)));
  }
});
