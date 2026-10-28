// Which language a request is in (#344, Breton #373), apart from the messages, so the
// Worker's edge cache can key on it.
export const CODES = ['en', 'fr', 'br'];
const supported = (code) => (CODES.includes(code) ? code : null);

export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_COOKIE = 'lang';

/** A request's language: its `lang` cookie, else the first it accepts, else English. */
export function languageOf(request) {
  const cookie = /(?:^|;\s*)lang=([a-z]{2})/.exec(request.headers.get('cookie') ?? '')?.[1];
  if (supported(cookie)) return cookie;
  const accepted = (request.headers.get('accept-language') ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { code: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter(({ code }) => code)
    .sort((a, b) => b.q - a.q);
  return accepted.map(({ code }) => supported(code)).find(Boolean) ?? DEFAULT_LANGUAGE;
}

