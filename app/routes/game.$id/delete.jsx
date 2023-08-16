import { redirect } from '@remix-run/node';

import { db } from '../../utils/db.server';
import { authorizer, canDelete } from '../../utils/auth.server';

export async function action(args) {
  const { params } = args;
  const { id } = params;

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await db.$transaction([
    db.$executeRawUnsafe(
      `SET LOCAL public.current_user_id = '${currentUser.id}';`
    ),
    db.game.delete({
      where: {
        id,
      },
    }),
  ]);

  return redirect('/games');
}
