import { describe, expect, it } from 'vitest';

import { MESSAGES, languageOf, translate } from './index';

const request = (headers) => new Request('https://community.indieco.xyz/', { headers });

describe('messages', () => {
  // A key missing in a language would show English (or the key) there.
  it.each(Object.keys(MESSAGES))('has every key in %s, with the same placeholders', (language) => {
    for (const [key, text] of Object.entries(MESSAGES.en)) {
      expect(MESSAGES[language], `${language}: ${key}`).toHaveProperty([key]);
      const names = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(names(MESSAGES[language][key]), `${language}: ${key}`).toEqual(names(text));
    }
    expect(Object.keys(MESSAGES[language]).sort()).toEqual(Object.keys(MESSAGES.en).sort());
  });
});

describe('languageOf', () => {
  it('takes the cookie first, then the browser’s languages by preference', () => {
    expect(languageOf(request({ cookie: 'theme=dark; lang=fr', 'accept-language': 'en-GB' }))).toBe('fr');
    expect(languageOf(request({ 'accept-language': 'de-DE, fr;q=0.8, en;q=0.5' }))).toBe('fr');
    expect(languageOf(request({ 'accept-language': 'de-DE' }))).toBe('en');
    expect(languageOf(request({ cookie: 'lang=xx' }))).toBe('en');
    // #373: Breton too (the root loader keeps it behind its flag).
    expect(languageOf(request({ cookie: 'lang=br' }))).toBe('br');
    expect(languageOf(request({ 'accept-language': 'br-FR, fr;q=0.8' }))).toBe('br');
  });
});

it('fills in values, numbers in the language’s way', () => {
  expect(translate('fr', 'nav.notificationsUnread', { count: 3 })).toBe('Notifications, 3 non lues');
  expect(translate('fr', 'lists.games.description', { count: 1234 })).toContain('1 234');
  expect(translate('en', 'lists.games.description', { count: 1234 })).toContain('1,234');
});
