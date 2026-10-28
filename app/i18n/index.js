// The site's languages (#344): English and French, chosen from a cookie, or
// the browser's Accept-Language, on the same URLs.
import { useRouteLoaderData } from 'react-router';

import en from './en';
import fr from './fr';

export const MESSAGES = { en, fr };
export const LANGUAGES = [
  ['en', 'English'],
  ['fr', 'Français'],
];
export { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, languageOf } from './language';
import { DEFAULT_LANGUAGE } from './language';

/** A message in `language`, with `{name}` replaced from `values`; English when missing. */
export function translate(language, key, values = {}) {
  const text = MESSAGES[language]?.[key] ?? MESSAGES.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) =>
    // Plain spaces: ICU's no-break ones differ between server and browser.
    typeof values[name] === 'number'
      ? values[name].toLocaleString(language).replace(/[\u00a0\u202f]/g, ' ')
      : String(values[name] ?? '')
  );
}

/** The page's language, from the root loader. */
export const useLanguage = () => useRouteLoaderData('root')?.language ?? DEFAULT_LANGUAGE;

/** `t(key, values)` in the page's language. */
export function useT() {
  const language = useLanguage();
  return (key, values) => translate(language, key, values);
}
