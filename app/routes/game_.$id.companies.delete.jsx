import { redirect } from "@remix-run/node";

import { db } from "../utils/db.server";
import { authorizer, canWrite } from '../utils/auth.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  await db.game_entity.delete({
    where: {
      game_id_entity_id: {
        game_id: id,
        entity_id: data.get('id'),
      },
    },
  });

  return redirect(`/game/${id}`);
}
