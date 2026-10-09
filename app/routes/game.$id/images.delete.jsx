import { redirect } from 'react-router';

import { removeGameImages } from '../../data/games.server';
import { authorizer, canDelete } from '../../utils/auth.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canDelete],
  });

  const data = await request.formData();

  await removeGameImages(id, data.getAll('id'));

  return redirect(`/game/${id}`);
}
