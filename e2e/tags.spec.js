import { eq, inArray } from 'drizzle-orm';

import { db, games, gameTags, tagAliases, tags } from './db.js';
import { expect, test, MEMBER, signIn } from './helpers';

// #207: new input is mapped to the canonical tag through tag aliases. (The
// duplicates themselves were merged by the tag_aliases migration, on
// Postgres, before the copy to D1.)

const run = Date.now() % 100000;

test('tags entered on a game are normalised and mapped through aliases', async ({ page }) => {
  const canonical = `e2e-co-op-${run}`;
  const alias = `e2e-coop-${run}`;
  const [tag] = await db.insert(tags).values({ name: canonical }).returning();
  await db.insert(tagAliases).values({ alias, tagId: tag.id });

  await signIn(page, MEMBER);
  const name = `Tagged ${run}`;
  const response = await page.request.post('/games/create', {
    form: { name, about: '', site: '', igdb_url: '', tags: ` ${alias.toUpperCase()}, , ${alias},  Solo  Dev ,` },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);

  const [game] = await db.select({ id: games.id }).from(games).where(eq(games.name, name));
  try {
    const names = await db
      .select({ name: tags.name })
      .from(gameTags)
      .innerJoin(tags, eq(tags.id, gameTags.tagId))
      .where(eq(gameTags.gameId, game.id));
    expect(names.map((t) => t.name).sort()).toEqual([canonical, 'solo dev'].sort());
  } finally {
    await db.delete(games).where(eq(games.id, game.id));
    await db.delete(tags).where(inArray(tags.name, [canonical, 'solo dev']));
  }
});
