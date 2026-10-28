// Choosing the interface's language (#344): remembered in a cookie for a
// year, then back to the page it was chosen on.
import { redirect } from 'react-router';

import { CODES, LANGUAGE_COOKIE } from '../i18n/language';
import { safeRedirectPath } from '../utils/safeRedirect';

export async function action({ request }) {
  const data = await request.formData();
  const language = CODES.includes(data.get('language')) ? data.get('language') : 'en';
  return redirect(safeRedirectPath(data.get('back'), '/'), {
    headers: { 'Set-Cookie': `${LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=31536000; SameSite=Lax` },
  });
}
