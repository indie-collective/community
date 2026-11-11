import { describe, expect, it } from 'vitest';

import { MESSAGES, languageOf, translate } from './index';

const request = (headers) => new Request('https://community.indieco.xyz/', { headers });

// The languages everyone is offered: a key missing there would show English (or the key).
// The others (Breton, behind its flag) are filled in on Weblate (#400) and may lag behind.
const SHIPPED = ['en', 'fr'];
const names = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('messages', () => {
  it.each(SHIPPED)('has every key in %s', (language) => {
    for (const key of Object.keys(MESSAGES.en)) {
      expect(MESSAGES[language][key], `${language}: ${key}`).toBeTruthy();
    }
  });

  it.each(Object.keys(MESSAGES))('has only English’s keys in %s, with the same placeholders', (language) => {
    for (const [key, text] of Object.entries(MESSAGES[language])) {
      expect(MESSAGES.en, `${language}: ${key}`).toHaveProperty([key]);
      if (text) expect(names(text), `${language}: ${key}`).toEqual(names(MESSAGES.en[key]));
    }
  });
});

it('falls back to English for a message not translated yet', () => {
  const breton = MESSAGES.br['nav.games'];
  try {
    MESSAGES.br['nav.games'] = ''; // How Weblate can write it
    expect(translate('br', 'nav.games')).toBe('Games');
    delete MESSAGES.br['nav.games'];
    expect(translate('br', 'nav.games')).toBe('Games');
  } finally {
    MESSAGES.br['nav.games'] = breton;
  }
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
