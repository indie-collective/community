import { redirect } from "react-router";

import { deleteOrganization } from '../data/organizations.server';
import { authorizer, canDelete } from "../utils/auth.server";

export async function action(args) {
  const { params } = args;
  const { id } = params;

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await deleteOrganization(id, { authorId: currentUser.id });

  return redirect('/orgs');
}
