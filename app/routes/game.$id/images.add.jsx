import { redirect } from 'react-router';

import { addGameImages } from '../../data/games.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { parseFormWithUploads } from '../../utils/createUploadHandler.server';
import { routeRecordId } from '../../utils/pageRecord.server';

export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await parseFormWithUploads(request, ['images']);

  await addGameImages(id, data.getAll('images'));

  return redirect(`/game/${id}`);
}
