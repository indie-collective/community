import { PrismaClient } from '@prisma/client';

import { expect, test, MEMBER, signIn } from './helpers';

// #207: duplicate tags (coop/co-op, platform/platformer…) are merged by the
// tag_aliases migration, and new input is mapped to the canonical tag.
const db = new PrismaClient();
test.afterAll(() => db.$disconnect());

const run = Date.now() % 100000;

test('merge_tag_variant moves games to the canonical tag and keeps an alias', async () => {
  const variant = `e2e-variant-${run}`;
  const canonical = `e2e-canonical-${run}`;
  const [onlyVariant, both] = await Promise.all(
    ['Only Variant', 'Both Tags'].map((name) => db.game.create({ data: { name: `${name} ${run}` } }))
  );
  const variantTag = await db.tag.create({ data: { name: variant } });
  const canonicalTag = await db.tag.create({ data: { name: canonical } });
  await db.game_tag.createMany({
    data: [
      { game_id: onlyVariant.id, tag_id: variantTag.id },
      { game_id: both.id, tag_id: variantTag.id },
      { game_id: both.id, tag_id: canonicalTag.id },
    ],
  });

  try {
    await db.$executeRaw`SELECT merge_tag_variant(${variant}, ${canonical})`;

    expect(await db.tag.findUnique({ where: { name: variant } })).toBeNull();
    for (const game of [onlyVariant, both]) {
      const tags = await db.game_tag.findMany({ where: { game_id: game.id }, select: { tag: { select: { name: true } } } });
      expect(tags.map(({ tag }) => tag.name)).toEqual([canonical]);
    }
    const alias = await db.tag_alias.findUnique({ where: { alias: variant }, select: { tag: { select: { name: true } } } });
    expect(alias.tag.name).toBe(canonical);
  } finally {
    await db.game.deleteMany({ where: { id: { in: [onlyVariant.id, both.id] } } });
    await db.tag.deleteMany({ where: { name: { in: [variant, canonical] } } });
  }
});

test('tags entered on a game are normalised and mapped through aliases', async ({ page }) => {
  const canonical = `e2e-co-op-${run}`;
  const alias = `e2e-coop-${run}`;
  const tag = await db.tag.create({ data: { name: canonical } });
  await db.tag_alias.create({ data: { alias, tag_id: tag.id } });

  await signIn(page, MEMBER);
  const name = `Tagged ${run}`;
  const response = await page.request.post('/games/create', {
    form: { name, about: '', site: '', igdb_url: '', tags: ` ${alias.toUpperCase()}, , ${alias},  Solo  Dev ,` },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);

  const game = await db.game.findFirst({ where: { name }, select: { id: true, game_tag: { select: { tag: { select: { name: true } } } } } });
  try {
    expect(game.game_tag.map(({ tag }) => tag.name).sort()).toEqual([canonical, 'solo dev'].sort());
  } finally {
    await db.game.delete({ where: { id: game.id } });
    await db.tag.deleteMany({ where: { name: { in: [canonical, 'solo dev'] } } });
  }
});
