import { redirect } from "react-router";

import { db } from "../utils/db.server";
import isAuthenticated from '../utils/isAuthenticated.server'

export async function action({ params, request }) {
  const { id } = params;

  const user = await isAuthenticated(request, {
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
