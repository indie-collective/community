import { redirect } from 'react-router';

import { leaveEvent } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server'
import { routeRecordId } from '../utils/pageRecord.server';

export async function action({ params, request }) {
  const id = await routeRecordId('event', params.id);

  const user = await isAuthenticated(request, true);

  await leaveEvent(id, user.id);

  return redirect(`/event/${id}`);
}
