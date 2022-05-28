import { redirect } from "@remix-run/node";

import { db } from "../utils/db.server";

export async function action({ params }) {
  const { id } = params;

  // todo check auth and replace with current user
  const user = await db.person.findFirst();

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
