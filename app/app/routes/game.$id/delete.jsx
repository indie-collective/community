import { redirect } from "@remix-run/node";

import { db } from "../../utils/db.server";

export async function action({ params }) {
  const { id } = params;

  await db.game.delete({
    where: {
      id,
    },
  });

  return redirect('/games');
}
