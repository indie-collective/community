import { redirect } from "react-router";

import { deleteOrganization } from '../data/organizations.server';
import { authorizer, canWrite } from "../utils/auth.server";

export async function action(args) {
  const { params } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  await deleteOrganization(id);

  return redirect('/orgs');
}
