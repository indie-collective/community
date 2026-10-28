import { setGameOrganizationRole } from '../../data/games.server';
import { GAME_ORGANIZATION_ROLES } from '../../db/schema.js';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

// Changes how a credited organisation took part in the game (#40), from
// `from` to `role`. Called by fetchers: no redirect, so the page stays where
// it is (#336).
export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();
  const from = data.get('from');
  const role = data.get('role');
  if (![from, role].every((value) => GAME_ORGANIZATION_ROLES.includes(value))) {
    throw new Response('Bad Request', { status: 400 });
  }

  await setGameOrganizationRole(id, data.get('id'), from, role, { authorId: currentUser.id });

  return { ok: true };
}
