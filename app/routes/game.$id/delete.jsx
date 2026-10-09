import { redirect } from 'react-router';

import { deleteGame } from '../../data/games.server';
import { authorizer, canDelete } from '../../utils/auth.server';

export async function action(args) {
  const { params } = args;
  const { id } = params;

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await deleteGame(id);

  return redirect('/games');
}
