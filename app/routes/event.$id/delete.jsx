import { redirect } from 'react-router';

import { deleteEvent } from '../../data/events.server';
import { authorizer, canDelete } from '../../utils/auth.server';

export async function action(args) {
  const { params } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await deleteEvent(id);

  return redirect(`/events`);
}
