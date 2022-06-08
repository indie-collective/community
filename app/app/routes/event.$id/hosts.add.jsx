import { redirect } from '@remix-run/node';

import { db } from '../../utils/db.server';

export async function action({ params, request }) {
  const { id } = params;

  const data = await request.formData();

  await db.entity_event.upsert({
    where: {
      entity_id_event_id: {
        entity_id: data.get('id'),
        event_id: id,
      },
    },
    create: {
      entity_id: data.get('id'),
      event_id: id,
    },
    update: {},
  });

  return redirect(`/event/${id}`);
}
