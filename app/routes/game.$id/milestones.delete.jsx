import { redirect } from 'react-router';

import { removeGameMilestone } from '../../data/games.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

// Removes a step from the game's timeline (#332).
export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();
  await removeGameMilestone(id, data.get('id'), { authorId: currentUser.id });

  return redirect(`/game/${id}`);
}
