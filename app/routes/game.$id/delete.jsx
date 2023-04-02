import { redirect } from '@remix-run/node';

import { db } from '../../utils/db.server';
import { authenticator } from '../../utils/auth.server';

export async function action({ request, params }) {
  const { id } = params;

  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: `/signin?redirect=/games/${id}`,
  });

  await db.$transaction([
    db.$executeRawUnsafe(
      `SET LOCAL current_user_id = '${currentUser.id}';`
    ),
    db.game.delete({
      where: {
        id,
      },
    }),
  ]);

  return redirect('/games');
}
