import { redirect } from "react-router";

import { destroySession, getSession } from "../utils/session.server";

export async function action({ request }) {
  const session = await getSession(request.headers.get('cookie'));

  throw redirect('/signin', {
    headers: { 'Set-Cookie': await destroySession(session) },
  });
};
