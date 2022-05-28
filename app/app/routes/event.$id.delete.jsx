import { redirect } from "@remix-run/node";

import { db } from "../utils/db.server";

export async function action({ params }) {
  const { id } = params;

  // todo check auth

  await db.event.delete({
    where: {
      id,
    },
  });

  return redirect(`/events`);
}