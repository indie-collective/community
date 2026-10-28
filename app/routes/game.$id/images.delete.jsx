import { redirect } from 'react-router';

import { removeGameImages } from '../../data/games.server';
import { authorizer, canDelete } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  const data = await request.formData();

  await removeGameImages(id, data.getAll('id'), { authorId: currentUser.id });

  return redirect(`/game/${id}`);
}
