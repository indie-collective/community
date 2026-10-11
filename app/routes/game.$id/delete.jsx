import { redirect } from 'react-router';

import { deleteGame } from '../../data/games.server';
import { authorizer, canDelete } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

export async function action(args) {
  const { params } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await deleteGame(id, { authorId: currentUser.id });

  return redirect('/games');
}
