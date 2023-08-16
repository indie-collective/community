import {
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { db } from '../../utils/db.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import createUploadHandler from '../../utils/createUploadHandler.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      createUploadHandler(['images']),
      unstable_createMemoryUploadHandler()
    )
  );

  await db.game_image.createMany({
    data: data.getAll('images').map((imageId) => ({
      game_id: id,
      image_id: imageId,
    })),
  });

  return redirect(`/game/${id}`);
}
