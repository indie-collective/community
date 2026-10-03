import { redirect } from 'react-router';

import { authenticator } from '../../utils/auth.server';
import { commitSession, getSession } from '../../utils/session.server';
import toSessionUser from '../../utils/sessionUser.server';
import { prevCookie } from '../../utils/prevCookie.server';
import { safeRedirectPath } from '../../utils/safeRedirect';

export async function loader({ request, params }) {
  try {
    const user = await authenticator.authenticate(params.provider, request);

    const session = await getSession(request.headers.get('cookie'));

    session.set('user', toSessionUser(user));

    // Back to the page that required sign-in, if the action remembered one.
    const prev = safeRedirectPath(await prevCookie.parse(request.headers.get('cookie')));

    const headers = new Headers();
    headers.append('Set-Cookie', await commitSession(session));
    headers.append('Set-Cookie', await prevCookie.serialize('', { maxAge: 0 }));

    return redirect(prev, { headers });
  } catch (err) {
    console.log(err);
    return redirect('/signin');
  }
}
