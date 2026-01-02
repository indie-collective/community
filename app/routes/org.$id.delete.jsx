import { redirect } from "@remix-run/node";

import { db } from "../utils/db.server";
import { authorizer, canWrite } from "../utils/auth.server";

export async function action(args) {
  const { params } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  await db.entity_member.deleteMany({
    where: {
      entity_id: id,
    },
  });

  await db.entity.delete({
    where: {
      id,
    },
  });

  return redirect('/orgs');
}
