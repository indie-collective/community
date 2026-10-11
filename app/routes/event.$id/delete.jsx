import { redirect } from 'react-router';

import { deleteEvent } from '../../data/events.server';
import { authorizer, canDelete } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

export async function action(args) {
  const { params } = args;
  const id = await routeRecordId('event', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await deleteEvent(id, { authorId: currentUser.id });

  return redirect(`/events`);
}
