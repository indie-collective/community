// Finding things: the games list, search, the rewind, the mission screen,
// and the member's own profile.
import { expect, within } from 'storybook/test';

import Games from '../../routes/games';
import MissionStep from '../../routes/missions.$kind.$gap';
import Profile from '../../routes/profile';
import Rewind from '../../routes/rewind.$year';
import Search from '../../routes/search';
import { GAPS } from '../../utils/missions';
import { associations, events, games, member, studios } from '../fixtures';

export default {
  title: 'Pages/Browse',
  parameters: { layout: 'fullscreen' },
};

const hasH1 = async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole('heading', { level: 1 })).toBeVisible();
};

const tags = ['Adventure', 'Puzzle', 'Narrative', 'Cozy', 'Strategy'].map((name, i) => ({
  id: `t-${name}`,
  name,
  game_tag: Array.from({ length: 12 - i * 2 }),
}));

export const GamesPage = {
  render: () => <Games />,
  parameters: {
    router: {
      path: 'games',
      url: '/games',
      loader: () => ({ games, tags, q: '', sort: 'recent', country: null, total: 1284, currentUser: null }),
    },
  },
  play: hasH1,
};

export const SearchPage = {
  render: () => <Search />,
  parameters: {
    router: {
      path: 'search',
      url: '/search?q=moss',
      loader: () => ({
        q: 'moss',
        kind: 'game',
        page: 1,
        counts: { game: 2, studio: 1, association: 0, event: 0, venue: 0 },
        results: {
          game: games.slice(0, 2).map((g) => ({ ...g, search_match: { field: 'related', text: 'Pixel \u0002Moss\u0003' } })),
          studio: studios.slice(0, 1),
        },
      }),
    },
  },
  play: hasH1,
};

export const SearchPageEmpty = {
  render: () => <Search />,
  parameters: {
    router: { path: 'search', url: '/search', loader: () => ({ q: '', kind: 'game', page: 1, counts: { game: 0, studio: 0, association: 0, event: 0, venue: 0 }, results: {} }) },
  },
};

export const RewindPage = {
  render: () => <Rewind />,
  parameters: {
    router: {
      path: 'rewind/:year',
      url: '/rewind/2026',
      loader: () => ({
        year: 2026,
        eventsCount: 96,
        gamesCount: 210,
        studiosCount: 58,
        associationsCount: 14,
        topTags: [
          { name: 'Narrative', count: 41 },
          { name: 'Puzzle', count: 33 },
          { name: 'Platformer', count: 29 },
        ],
        topLocations: [
          { city: 'Paris', country: 'FR', total: 22 },
          { city: 'Nantes', country: 'FR', total: 9 },
        ],
        latest: 2026,
      }),
    },
  },
  // Its title isn't an h1 yet (it's Chakra's default h2).
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('heading', { name: 'Rewind 2026' })).toBeVisible();
  },
};

const gap = GAPS.game.find(({ key }) => key === 'about');

export const MissionStepPage = {
  render: () => <MissionStep />,
  parameters: {
    router: {
      path: 'missions/:kind/:gap',
      url: '/missions/game/about',
      currentUser: member,
      loader: () => ({
        kind: 'game',
        gap,
        n: 2,
        start: 1,
        next: { record: { id: 'g3', name: 'Iron Tide', path: '/game/g3', site: 'https://irontide.example' } },
      }),
    },
  },
  play: hasH1,
};

export const MissionDonePage = {
  render: () => <MissionStep />,
  parameters: {
    router: {
      path: 'missions/:kind/:gap',
      url: '/missions/game/about?n=6',
      currentUser: member,
      loader: () => ({
        kind: 'game',
        gap,
        summary: { points: 15, completed: 5, unlocked: [], ranOut: false },
      }),
    },
  },
};

export const ProfilePage = {
  render: () => <Profile />,
  parameters: {
    router: {
      path: 'profile',
      url: '/profile',
      currentUser: member,
      loader: () => ({
        currentUser: member,
        calendarPath: '/people/member/calendar.ics',
        feedPath: '/people/member/feed.xml',
        following: [
          { id: 's1', type: 'organization', name: studios[0].name, path: '/org/s1' },
          { id: 'a1', type: 'organization', name: associations[0].name, path: '/org/a1' },
          { id: 'e1', type: 'event', name: events[0].name, path: '/event/e1' },
        ],
      }),
    },
  },
  play: hasH1,
};
