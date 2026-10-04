import { drizzle } from 'drizzle-orm/d1';
import { and, eq, desc } from 'drizzle-orm';
import * as schema from './schema.js';

// The same representative read as the Prisma spike: the game page's tree.
export default {
  async fetch(request, env) {
    const db = drizzle(env.DB, { schema });
    const id = new URL(request.url).searchParams.get('id');
    const t0 = performance.now();
    const game = await db.query.game.findFirst({
      where: and(eq(schema.game.id, id), eq(schema.game.deleted, false)),
      with: {
        game_tag: { with: { tag: true } },
        game_image: { with: { image: true } },
        game_entity: { with: { entity: { with: { logo: true, location: true } } } },
        game_event: { with: { event: { with: { cover: true, location: true } } } },
      },
    });
    const games = await db.query.game.findMany({ where: eq(schema.game.deleted, false), limit: 30, orderBy: desc(schema.game.updated_at), with: { game_image: { with: { image: true } }, game_tag: { with: { tag: true } } } });
    return Response.json({ ms: performance.now() - t0, name: game?.name, count: games.length });
  },
};
