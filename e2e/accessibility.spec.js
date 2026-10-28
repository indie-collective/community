import AxeBuilder from '@axe-core/playwright';
import { eq } from 'drizzle-orm';

import { db, gameImages, games, retryBusy } from './db.js';
import { expect, test, MEMBER, signIn, waitForHydration } from './helpers';

// #350: WCAG 2.2 AA on the main pages, in light and dark, with the keyboard.

const STATIC = ['/', '/games', '/studios', '/associations', '/publishers', '/events', '/opportunities', '/places', '/countries', '/search?q=game', '/about', '/signin', '/missions', '/data', '/api'];

// A record page of each kind, from its list.
async function recordPages(request) {
  const first = async (list, pattern) => (await (await request.get(list)).text()).match(pattern)?.[0];
  return [
    await first('/games', /\/game\/[a-z0-9-]+/),
    await first('/studios', /\/org\/[a-z0-9-]+/),
    await first('/events', /\/event\/[a-z0-9-]+/),
    await first('/countries', /\/country\/[a-z]{2}/),
  ].filter(Boolean);
}

for (const scheme of ['light', 'dark']) {
  test(`the main pages have no serious accessibility issues (${scheme})`, async ({ page, request }) => {
    test.setTimeout(180000);
    await page.emulateMedia({ colorScheme: scheme });
    const found = [];
    for (const path of [...STATIC, ...(await recordPages(request))]) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      for (const violation of violations.filter((v) => ['serious', 'critical'].includes(v.impact))) {
        found.push(`${path}: ${violation.id} (${violation.nodes.length}): ${violation.nodes[0]?.target.join(' ')}`);
      }
    }
    expect(found).toEqual([]);
  });
}

test('the skip link jumps past the header', async ({ page }) => {
  await page.goto('/games');
  await waitForHydration(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#content$/);
});

test("a game's images open from the keyboard, and members describe them", async ({ page }) => {
  const [game] = await db.insert(games).values({ name: `Described ${Date.now() % 100000}` }).returning();
  await db.insert(gameImages).values({ gameId: game.id, key: 'missing.webp', position: 0 });
  try {
    await signIn(page, MEMBER);
    await page.goto(`/game/${game.id}`);
    await waitForHydration(page);
    page.once('dialog', (dialog) => dialog.accept('A knight on a cliff at dawn'));
    const saved = page.waitForResponse((response) => response.url().includes('/images/alt'));
    await page.getByRole('button', { name: 'Describe image 1' }).click();
    await saved;
    const [image] = await retryBusy(() => db.select().from(gameImages).where(eq(gameImages.gameId, game.id)));
    expect(image.alt).toBe('A knight on a cliff at dawn');

    await page.reload();
    const open = page.getByRole('button', { name: 'A knight on a cliff at dawn: open' });
    await expect(open.getByRole('img', { name: 'A knight on a cliff at dawn' })).toBeAttached();
    await open.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  } finally {
    await retryBusy(() => db.delete(games).where(eq(games.id, game.id)));
  }
});
