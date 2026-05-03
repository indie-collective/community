import { redirect } from 'react-router';

import { authenticator } from '../../utils/auth.server';
import { commitSession, getSession } from '../../utils/session.server';

export async function loader({ request, params }) {
  try {
    const user = await authenticator.authenticate(params.provider, request);

    const session = await getSession(request.headers.get('cookie'));

    session.set('user', user);

    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (err) {
    console.log(err);
    return redirect('/signin');
  }
}
