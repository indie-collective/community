import { redirect } from '@remix-run/node';

import { db } from '../utils/db.server';
import { authorizer, canDelete } from '../utils/auth.server';

export async function action(args) {
  const { params } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await db.event.delete({
    where: {
      id,
    },
  });

  return redirect(`/events`);
}
