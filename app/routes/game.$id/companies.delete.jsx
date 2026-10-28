import { GAME_ORGANIZATION_ROLES } from '../../db/schema.js';
import { removeGameOrganization } from '../../data/games.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

// Removes one of an organisation's roles on the game (#335). Called by
// fetchers: no redirect, so the page stays where it is (#336).
export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();
  const role = data.get('role');
  if (!GAME_ORGANIZATION_ROLES.includes(role)) {
    throw new Response('Bad Request', { status: 400 });
  }

  await removeGameOrganization(id, data.get('id'), role, { authorId: currentUser.id });

  return { ok: true };
}
