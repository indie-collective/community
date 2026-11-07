// A record's own page: a game, a studio or association, an event, a venue,
// a country, a person.
import { expect, within } from 'storybook/test';

import Country from '../../routes/country.$code';
import Event from '../../routes/event.$id';
import Game from '../../routes/game.$id';
import Org from '../../routes/org.$id';
import Person from '../../routes/people.$username';
import Venue from '../../routes/venue.$id';
import {
  PLACES,
  associations,
  events,
  games,
  member,
  studios,
} from '../fixtures';

export default {
  title: 'Pages/Records',
  parameters: { layout: 'fullscreen' },
};

const hasH1 = (name) => async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole('heading', { level: 1, name })).toBeVisible();
};

const [salt] = games;

const game = {
  id: salt.id,
  slug: salt.slug,
  name: salt.name,
  site: 'https://lanternbay.example',
  about: 'A narrative adventure about a lighthouse keeper and the town that forgot her.',
  game_image: [],
  game_entity: [
    { entity: studios[1], role: 'developer' },
    { entity: { ...studios[2], type: 'publisher' }, role: 'publisher' },
  ],
  game_tag: salt.tags.map((tag) => ({ tag })),
  game_event: [{ event: events[1] }],
  game_milestone: [
    { id: 'm1', kind: 'announced', date: '2025-01-15', date_precision: 'day' },
    { id: 'm2', kind: 'released', date: '2026-09-12', date_precision: 'day' },
  ],
};

export const GamePage = {
  render: () => <Game />,
  parameters: {
    router: {
      path: 'game/:id',
      url: '/game/g1',
      loader: () => ({ game, currentUser: null, opportunities: null, following: false, sources: [] }),
    },
  },
  play: hasH1('Salt and Lanterns'),
};

export const GamePageMember = {
  render: () => <Game />,
  parameters: {
    router: {
      path: 'game/:id',
      url: '/game/g1',
      currentUser: member,
      loader: () => ({ game, currentUser: member, opportunities: null, following: true, sources: [] }),
    },
  },
};

const org = {
  ...studios[0],
  status: 'active',
  site: 'https://pixelmoss.example',
  bsky_handle: 'pixelmoss.bsky.social',
  about: 'A small studio making cozy puzzle games in Nantes.',
  logo: null,
  game_entity: [
    { game: games[1], role: 'developer' },
    { game: games[0], role: 'publisher' },
  ],
  entity_event: [{ event: events[0] }],
};

export const OrgPage = {
  render: () => <Org />,
  parameters: {
    router: {
      path: 'org/:id',
      url: '/org/s1',
      loader: () => ({ org, currentUser: null, opportunities: null, following: false, sources: [] }),
    },
  },
  play: hasH1('Pixel Moss'),
};

const event = {
  ...events[0],
  about: 'Forty-eight hours to make a game around a theme announced on Friday night.',
  site: 'https://nantesjam.example',
  ticket_url: null,
  online_url: null,
  venue: { id: 'v1', slug: 'le-lieu-unique', name: 'Le Lieu Unique', location: PLACES.nantes },
  game_event: [{ game: games[1] }],
  entity_event: [{ entity: associations[0] }],
  event_participant: [{ person: { id: 'p1', username: 'member', first_name: 'Camille' } }],
  cover: null,
};

export const EventPage = {
  render: () => <Event />,
  parameters: {
    router: {
      path: 'event/:id',
      url: '/event/e1',
      loader: () => ({
        event,
        editions: [],
        relatedEvents: events.slice(1, 4),
        currentUser: null,
        opportunities: null,
        following: false,
        sources: [],
      }),
    },
  },
  play: hasH1('Nantes Game Jam'),
};

export const VenuePage = {
  render: () => <Venue />,
  parameters: {
    router: {
      path: 'venue/:id',
      url: '/venue/v1',
      loader: () => ({
        venue: { id: 'v1', slug: 'le-lieu-unique', name: 'Le Lieu Unique', about: 'An arts centre in the old LU biscuit factory.', site: 'https://lelieuunique.example', location: PLACES.nantes },
        events: { upcoming: events.slice(0, 2), past: [] },
        currentUser: null,
      }),
    },
  },
  play: hasH1('Le Lieu Unique'),
};

export const CountryPage = {
  render: () => <Country />,
  parameters: {
    router: {
      path: 'country/:code',
      url: '/country/fr',
      loader: () => ({
        country: {
          code: 'FR',
          name: 'France',
          counts: { studios: 120, associations: 34, games: 410, events: 22, cities: 38 },
          cities: [
            { name: 'Paris', region: 'Île-de-France', count: 42, studios: 34, associations: 8 },
            { name: 'Nantes', region: 'Pays de la Loire', count: 11, studios: 7, associations: 4 },
          ],
          hasMap: false,
          recentGames: games.slice(0, 4),
          upcomingEvents: events.slice(0, 3),
          venues: [],
          associations: [
            { city: 'Nantes', associations: [{ id: 'a1', name: 'Indie Collective' }] },
            { city: 'Rennes', associations: [{ id: 'a2', name: 'Bretagne Game Makers' }] },
          ],
        },
        currentUser: null,
        following: false,
      }),
    },
  },
  play: hasH1(/France/),
};

export const PersonPage = {
  render: () => <Person />,
  parameters: {
    router: {
      path: 'people/:username',
      url: '/people/member',
      loader: () => ({
        profile: {
          username: 'member',
          first_name: 'Camille',
          about: 'Makes small games in Nantes.',
          avatar: null,
          points: 148,
          completed: 31,
          badges: [{ key: 'first-find', tier: 'bronze', name: 'First find', description: 'Added a first record.' }],
          since: '2024-03-02T10:00:00.000Z',
          attending: { upcoming: events.slice(1, 2), past: [] },
          contributions: {
            added: 12,
            edited: 40,
            latest: [
              { id: 'c1', operation: 'create', kind: 'game', name: 'Moss Garden', path: '/game/g2', created_at: '2026-11-03T10:00:00.000Z' },
              { id: 'c2', operation: 'update', kind: 'organization', name: 'Pixel Moss', path: '/org/s1', created_at: '2026-10-28T10:00:00.000Z' },
            ],
          },
          own: false,
          hidden: false,
        },
      }),
    },
  },
  play: hasH1(/Camille/),
};
