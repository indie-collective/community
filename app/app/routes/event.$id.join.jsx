import { redirect } from "@remix-run/node";

import { db } from "../utils/db.server";
import { authenticator } from "../utils/auth.server";

export async function action({ params, request }) {
  const { id } = params;

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  await db.event_participant.upsert({
    where: {
      event_id_person_id: {
        event_id: id,
        person_id: user.id,
      },
    },
    create: {
      event_id: id,
      person_id: user.id,
    },
    update: {}
  })

  return redirect(`/event/${id}`);
}
