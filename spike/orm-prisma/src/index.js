import { PrismaClient } from './generated/prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// A representative read: the game page's query tree.
export default {
  async fetch(request, env) {
    const db = new PrismaClient({ adapter: new PrismaD1(env.DB) });
    const id = new URL(request.url).searchParams.get('id');
    const t0 = performance.now();
    const game = await db.game.findFirst({
      where: { id, deleted: false },
      include: {
        game_tag: { include: { tag: true } },
        game_image: { include: { image: true } },
        game_entity: { include: { entity: { include: { logo: true, location: true } } } },
        game_event: { include: { event: { include: { cover: true, location: true } } } },
      },
    });
    const games = await db.game.findMany({ where: { deleted: false }, take: 30, orderBy: { updated_at: 'desc' }, include: { game_image: { include: { image: true } }, game_tag: { include: { tag: true } } } });
    return Response.json({ ms: performance.now() - t0, name: game?.name, count: games.length });
  },
};
