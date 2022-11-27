import { redirect } from '@remix-run/node';

import { db } from '../../utils/db.server';

export async function action({ params, request }) {
  const { id } = params;

  const data = await request.formData();

  await db.game_entity.upsert({
    where: {
      game_id_entity_id: {
        game_id: id,
        entity_id: data.get('id'),
      },
    },
    create: {
      game_id: id,
      entity_id: data.get('id'),
    },
    update: {},
  });

  return redirect(`/game/${id}`);
}
