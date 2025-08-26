import { redirect } from '@remix-run/node';

import { db } from '../utils/db.server';
import { authorizer, canDelete } from '../utils/auth.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canDelete],
  });

  const data = await request.formData();

  await db.game_image.deleteMany({
    where: {
      OR: data.getAll('id').map((deleteId) => ({
        game_id: id,
        image_id: deleteId,
      })),
    },
  });

  return redirect(`/game/${id}`);
}
