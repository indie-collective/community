import { describe, expect, it } from 'vitest';

import { blueskyFields, detectSource, fillsFor, pageFields, parsePage, steamFields } from './sources';

describe('detectSource', () => {
  it('knows Steam, itch.io and Bluesky pages from websites', () => {
    expect(detectSource('https://store.steampowered.com/app/1145360/Hades/')).toEqual({
      source: 'steam',
      id: '1145360',
      url: 'https://store.steampowered.com/app/1145360/',
    });
    expect(detectSource('heros.itch.io/game').source).toBe('itch');
    expect(detectSource('https://bsky.app/profile/Heros.bsky.social')).toMatchObject({ source: 'bluesky', id: 'heros.bsky.social' });
    expect(detectSource('https://heros.fr').source).toBe('website');
    expect(detectSource('not a url')).toBeNull();
  });
});

const studioPage = `<!doctype html><html><head>
<title>Héros &amp; Co — indie studio</title>
<meta property="og:description" content="We make &quot;tiny&quot; games in Lyon.">
<meta property="og:image" content="/logo.png">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Héros & Co","url":"https://heros.fr","sameAs":["https://bsky.app/profile/heros.bsky.social"],"address":{"@type":"PostalAddress","addressLocality":"Lyon","addressCountry":"FR"}}]}</script>
</head><body></body></html>`;

describe('parsePage and pageFields', () => {
  it('reads an organisation from JSON-LD and meta tags', () => {
    const page = parsePage(studioPage, 'https://heros.fr/about');
    expect(pageFields(page, 'organization', 'https://heros.fr/about')).toEqual({
      name: 'Héros & Co',
      about: 'We make "tiny" games in Lyon.',
      site: 'https://heros.fr/',
      image: 'https://heros.fr/logo.png',
      bsky_handle: 'heros.bsky.social',
      place: { name: null, street: null, city: 'Lyon', country_code: 'FR' },
    });
  });

  it('reads an event: wall-clock times where it happens, place, tickets, attendance', () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      '@type': 'Event',
      name: 'Stunfest 2026',
      startDate: '2026-11-20T14:00:00+01:00',
      endDate: '2026-11-22T19:30:00+01:00',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: [
        { '@type': 'Place', name: 'Le Liberté', address: { '@type': 'PostalAddress', streetAddress: '1 Esplanade', addressLocality: 'Rennes', addressCountry: 'FR' } },
        { '@type': 'VirtualLocation', url: 'https://twitch.tv/stunfest' },
      ],
      offers: { '@type': 'Offer', url: '/tickets' },
    })}</script>`;
    const fields = pageFields(parsePage(html, 'https://stunfest.com/'), 'event', 'https://stunfest.com/');
    expect(fields).toMatchObject({
      name: 'Stunfest 2026',
      starts_at: { local: '2026-11-20T14:00', instant: '2026-11-20T13:00:00.000Z' },
      ends_at: { local: '2026-11-22T19:30' },
      place: { name: 'Le Liberté', street: '1 Esplanade', city: 'Rennes', country_code: 'FR' },
      attendance: 'hybrid',
      online_url: 'https://twitch.tv/stunfest',
      ticket_url: 'https://stunfest.com/tickets',
      canceled: false,
    });
  });

  it('falls back on meta tags when there is no JSON-LD', () => {
    const page = parsePage('<meta name="description" content="A game."><meta property="og:title" content="Héros">', 'https://heros.itch.io/heros');
    expect(pageFields(page, 'game', 'https://heros.itch.io/heros')).toEqual({ name: 'Héros', about: 'A game.', site: 'https://heros.itch.io/heros' });
  });
});

it('reads a Steam app, without its HTML', () => {
  const answer = {
    7: {
      success: true,
      data: {
        name: 'Héros',
        short_description: 'A <b>bold</b> game &amp; more.',
        website: 'https://heros.fr',
        header_image: 'https://cdn/header.jpg',
        developers: ['Héros Studio'],
        release_date: { coming_soon: true, date: 'Coming soon' },
        genres: [{ description: 'Indie' }],
      },
    },
  };
  expect(steamFields(answer, '7')).toEqual({
    name: 'Héros',
    about: 'A bold game & more.',
    site: 'https://heros.fr',
    image: 'https://cdn/header.jpg',
    developers: ['Héros Studio'],
    coming_soon: true,
    release_date: 'Coming soon',
    genres: ['Indie'],
  });
  expect(steamFields({ 7: { success: false } }, '7')).toBeNull();
});

it('reads a Bluesky profile', () => {
  expect(blueskyFields({ handle: 'heros.bsky.social', displayName: 'Héros', description: 'Hi', avatar: 'https://a' })).toEqual({
    name: 'Héros',
    about: 'Hi',
    image: 'https://a',
    bsky_handle: 'heros.bsky.social',
  });
});

describe('fillsFor', () => {
  it('fills only empty fields people never edited, that the record can take', () => {
    expect(
      fillsFor('organization', { about: '', site: 'https://mine', bsky_handle: null }, { about: 'From the site', site: 'https://theirs', bsky_handle: 'x.bsky.social', name: 'Other' }, [
        'bsky_handle',
      ])
    ).toEqual({ about: 'From the site' });
  });
});
