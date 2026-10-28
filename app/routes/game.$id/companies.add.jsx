import { GAME_ORGANIZATION_ROLES } from '../../db/schema.js';
import { addGameOrganization } from '../../data/games.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';
import { afterLinking, pickedOrCreated } from '../../utils/quickCreate.server';

// Credits an organisation on the game, in `role` if given (#335). Called by
// fetchers: no redirect, so the page stays where it is (#336).
export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();
  const role = data.get('role') || undefined;
  if (role && !GAME_ORGANIZATION_ROLES.includes(role)) {
    throw new Response('Bad Request', { status: 400 });
  }

  // An existing organisation, or one added by name from the picker (#374).
  const picked = await pickedOrCreated('organization', data, { request, currentUser });
  await addGameOrganization(id, picked.id, role, { authorId: currentUser.id });

  return afterLinking(picked, `/game/${id}`) ?? { ok: true };
}
