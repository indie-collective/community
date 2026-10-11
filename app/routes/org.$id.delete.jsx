import { redirect } from "react-router";

import { deleteOrganization } from '../data/organizations.server';
import { authorizer, canDelete } from "../utils/auth.server";
import { routeRecordId } from '../utils/pageRecord.server';

export async function action(args) {
  const { params } = args;
  const id = await routeRecordId('organization', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canDelete],
  });

  await deleteOrganization(id, { authorId: currentUser.id });

  return redirect('/orgs');
}
