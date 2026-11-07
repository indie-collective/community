// Made-up but plausible data for stories: the shapes the loaders return.
// Pictures are left out, so cards show the site's own placeholders and
// stories never wait on the network for them.

const place = (city, region, country_code, latitude, longitude) => ({
  city,
  region,
  country_code,
  latitude,
  longitude,
});

export const PLACES = {
  nantes: place('Nantes', 'Pays de la Loire', 'FR', 47.218, -1.553),
  rennes: place('Rennes', 'Bretagne', 'FR', 48.117, -1.677),
  lyon: place('Lyon', 'Auvergne-Rhône-Alpes', 'FR', 45.764, 4.835),
  brussels: place('Brussels', 'Brussels', 'BE', 50.85, 4.351),
  montreal: place('Montréal', 'Québec', 'CA', 45.501, -73.567),
  berlin: place('Berlin', 'Berlin', 'DE', 52.52, 13.405),
};

const org = (id, name, type, location) => ({
  id,
  slug: id,
  name,
  type,
  location,
});

export const studios = [
  org('s1', 'Pixel Moss', 'studio', PLACES.nantes),
  org('s2', 'Lantern Bay Games', 'studio', PLACES.rennes),
  org('s3', 'Ferrous', 'studio', PLACES.lyon),
  org('s4', 'Les Ateliers Nuit', 'studio', PLACES.montreal),
  org('s5', 'Kleine Riesen', 'studio', PLACES.berlin),
  org('s6', 'Cabane Studio', 'studio', PLACES.brussels),
];

export const associations = [
  org('a1', 'Indie Collective', 'association', PLACES.nantes),
  org('a2', 'Bretagne Game Makers', 'association', PLACES.rennes),
  org('a3', 'Lyon Game Dev', 'association', PLACES.lyon),
  org('a4', 'Brussels Game Jam', 'association', PLACES.brussels),
  org('a5', 'MTL Indie', 'association', PLACES.montreal),
  org('a6', 'Berlin Playmakers', 'association', PLACES.berlin),
];

const tags = (...names) => names.map((name) => ({ id: `t-${name}`, name }));

const game = (id, name, studio, tagNames) => ({
  id,
  slug: id,
  name,
  entities: [{ id: studio.id, name: studio.name }],
  tags: tags(...tagNames),
});

export const games = [
  game('g1', 'Salt and Lanterns', studios[1], ['Adventure', 'Narrative']),
  game('g2', 'Moss Garden', studios[0], ['Puzzle', 'Cozy']),
  game('g3', 'Iron Tide', studios[2], ['Strategy']),
  game('g4', 'Night Shift Bakery', studios[3], ['Management', 'Cozy']),
  game('g5', 'Small Giants', studios[4], ['Platformer']),
  game('g6', 'The Cabin at Lake End', studios[5], ['Narrative', 'Horror']),
];

const event = (id, name, starts_at, ends_at, location, more = {}) => ({
  id,
  slug: id,
  name,
  starts_at,
  ends_at,
  time_zone: 'Europe/Paris',
  attendance: 'in_person',
  status: 'scheduled',
  location,
  event_participant: [],
  ...more,
});

// Around 7 November 2026, the stories' "today".
export const TODAY = '2026-11-07';

export const events = [
  event(
    'e1',
    'Nantes Game Jam',
    '2026-11-13T17:00:00.000Z',
    '2026-11-15T17:00:00.000Z',
    PLACES.nantes
  ),
  event(
    'e2',
    'Indie Showcase Night',
    '2026-11-19T18:00:00.000Z',
    '2026-11-19T22:00:00.000Z',
    PLACES.rennes,
    { event_participant: [{ person_id: 'p1' }] }
  ),
  event(
    'e3',
    'Narrative Design Meetup',
    '2026-11-21T17:30:00.000Z',
    '2026-11-21T20:00:00.000Z',
    null,
    { attendance: 'online' }
  ),
  event(
    'e4',
    'Lyon Playtest Evening',
    '2026-11-24T18:00:00.000Z',
    '2026-11-24T21:00:00.000Z',
    PLACES.lyon,
    { status: 'canceled' }
  ),
  event(
    'e5',
    'Brussels Games Week',
    '2026-11-26T09:00:00.000Z',
    '2026-11-29T18:00:00.000Z',
    PLACES.brussels,
    { attendance: 'hybrid' }
  ),
  event(
    'e6',
    'Winter Jam',
    '2026-12-04T17:00:00.000Z',
    '2026-12-06T17:00:00.000Z',
    PLACES.berlin
  ),
];

export const pastEvents = [
  event(
    'e0',
    'Autumn Meetup',
    '2026-10-22T17:00:00.000Z',
    '2026-10-22T21:00:00.000Z',
    PLACES.nantes
  ),
];

export const member = {
  id: 'p1',
  username: 'member',
  first_name: 'Camille',
  isAdmin: false,
};

export const mapPoints = [...studios, ...associations].map(({ location, type }) => [
  location.latitude,
  location.longitude,
  type,
]);

const country = (code, name, continent, studios, associations, games, events) => ({
  code,
  name,
  continent,
  studios,
  associations,
  games,
  events,
});

// The countries table's rows (utils/countryTable).
export const countries = [
  country('FR', 'France', 'EU', 120, 34, 410, 22),
  country('BE', 'Belgium', 'EU', 18, 6, 40, 5),
  country('CA', 'Canada', 'NA', 64, 9, 150, 8),
  country('BR', 'Brazil', 'SA', 22, 4, 31, 2),
  country('JP', 'Japan', 'AS', 30, 2, 88, 3),
  country('AU', 'Australia', 'OC', 25, 5, 60, 4),
  country('KE', 'Kenya', 'AF', 3, 1, 4, 1),
];

// A list page's filters (Filters).
export const facets = {
  countries: [
    { country_code: 'FR', _count: 3 },
    { country_code: 'BE', _count: 1 },
    { country_code: 'DE', _count: 1 },
  ],
  years: [{ year: '2026' }, { year: '2025' }],
};

export const admin = { ...member, id: 'p9', username: 'admin', first_name: 'Alex', isAdmin: true };
