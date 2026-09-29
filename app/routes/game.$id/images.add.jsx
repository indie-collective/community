import { redirect } from 'react-router';

import { db } from '../../utils/db.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { parseFormWithUploads } from '../../utils/createUploadHandler.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await parseFormWithUploads(request, ['images']);

  await db.game_image.createMany({
    data: data.getAll('images').map((imageId) => ({
      game_id: id,
      image_id: imageId,
    })),
  });

  return redirect(`/game/${id}`);
}
