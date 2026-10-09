import { redirect } from "react-router";

import { joinEvent } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server'

export async function action({ params, request }) {
  const { id } = params;

  const user = await isAuthenticated(request, true);

  await joinEvent(id, user.id);

  return redirect(`/event/${id}`);
}
