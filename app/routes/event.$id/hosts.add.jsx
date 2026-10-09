import { redirect } from 'react-router';

import { addEventOrganization } from '../../data/events.server';
import { authorizer, canWrite } from '../../utils/auth.server';

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  await addEventOrganization(id, data.get('id'));

  return redirect(`/event/${id}`);
}
