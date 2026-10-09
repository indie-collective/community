import { redirect } from "react-router";

import { removeGameOrganization } from '../../data/games.server';
import { authorizer, canWrite } from '../../utils/auth.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  await removeGameOrganization(id, data.get('id'));

  return redirect(`/game/${id}`);
}
