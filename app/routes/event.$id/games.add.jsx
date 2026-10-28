import { redirect } from 'react-router';

import { addEventGame } from '../../data/events.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';
import { afterLinking, pickedOrCreated } from '../../utils/quickCreate.server';

export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('event', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  // An existing one, or one added by name from the picker (#374).
  const picked = await pickedOrCreated('game', data, { request, currentUser });
  await addEventGame(id, picked.id, { authorId: currentUser.id });

  const back = `/event/${id}`;
  return afterLinking(picked, back) ?? redirect(back);
}
