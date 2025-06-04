import { redirect } from "@remix-run/node";

import { db } from "../../utils/db.server";
import { authorizer, canWrite } from "../../utils/auth.server";

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  await db.game_event.delete({
    where: {
      game_id_event_id: {
        game_id: data.get('id'),
        event_id: id,
      },
    },
  });

  return redirect(`/event/${id}`);
}
