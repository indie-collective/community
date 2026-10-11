import { redirect } from 'react-router';

import { setGameOrganizationRole } from '../../data/games.server';
import { GAME_ORGANIZATION_ROLES } from '../../db/schema.js';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

// Sets how a credited organisation took part in the game (#40).
export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();
  const role = data.get('role');
  if (!GAME_ORGANIZATION_ROLES.includes(role)) {
    throw new Response('Bad Request', { status: 400 });
  }

  await setGameOrganizationRole(id, data.get('id'), role);

  return redirect(`/game/${id}`);
}
