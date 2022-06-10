import { redirect } from '@remix-run/node';

import { db } from '../../utils/db.server';

export async function action({ params, request }) {
  const { id } = params;

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
