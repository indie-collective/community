import { redirect } from '@remix-run/node';

import { db } from '../../utils/db.server';
import { authorizer, canWrite } from '../../utils/auth.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

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
