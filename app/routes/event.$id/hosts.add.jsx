import { redirect } from 'react-router';

import { addEventOrganization } from '../../data/events.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('event', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  await addEventOrganization(id, data.get('id'), { authorId: currentUser.id });

  return redirect(`/event/${id}`);
}
