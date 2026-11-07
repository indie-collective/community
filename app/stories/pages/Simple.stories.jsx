// Small pages, one story each: what a visitor (or member) sees on arrival.
import { expect, within } from 'storybook/test';

import NotFound from '../../routes/$';
import About from '../../routes/about';
import Countries from '../../routes/countries';
import Data from '../../routes/data';
import Missions from '../../routes/missions';
import Notifications from '../../routes/notifications';
import Opportunities from '../../routes/opportunities';
import NewOpportunity from '../../routes/opportunities.new';
import Orgs from '../../routes/orgs';
import ProfileEdit from '../../routes/profile.edit';
import Signin from '../../routes/signin';
import Welcome from '../../routes/welcome';
import { GAPS } from '../../utils/missions';
import { associations, countries, facets, member, studios } from '../fixtures';

export default {
  title: 'Pages/Simple',
  parameters: { layout: 'fullscreen' },
};

const hasH1 = (name) => async ({ canvasElement }) => {
  await expect(
    await within(canvasElement).findByRole('heading', { level: 1, ...(name && { name }) })
  ).toBeVisible();
};

export const NotFoundPage = { render: () => <NotFound />, play: hasH1() };

export const AboutPage = {
  render: () => <About />,
  parameters: { router: { loader: () => ({ gamesCount: 1284, entitiesCount: 412, eventsCount: 96 }) } },
  play: hasH1(),
};

export const CountriesPage = {
  render: () => <Countries />,
  parameters: { router: { loader: () => ({ countries }) } },
  play: hasH1(),
};

export const DataPage = {
  render: () => <Data />,
  parameters: {
    router: {
      loader: () => ({
        exports: [
          { name: 'games.csv', size: 482133 },
          { name: 'organizations.csv', size: 120554 },
          { name: 'events.json', size: 98112 },
        ],
        isAdmin: false,
      }),
    },
  },
  play: hasH1(),
};

const counts = Object.fromEntries(
  Object.entries(GAPS).map(([kind, gaps]) => [
    kind,
    Object.fromEntries(gaps.map(({ key }, i) => [key, (i + 1) * 37])),
  ])
);

export const MissionsPage = {
  render: () => <Missions />,
  parameters: { router: { loader: () => ({ counts, stats: null, signedIn: false }) } },
  play: hasH1(),
};

export const MissionsPageSignedIn = {
  render: () => <Missions />,
  parameters: {
    router: {
      currentUser: member,
      loader: () => ({
        counts,
        signedIn: true,
        stats: {
          points: 148,
          records: 31,
          achievements: [{ key: 'first-find', tier: 'bronze', name: 'First find', description: 'Added a first record.' }],
          progress: [
            { key: 'first-find', tier: 'bronze', name: 'First find', description: 'Added a first record.' },
            { key: 'records-100', tier: 'gold', name: 'Archivist', description: 'Added 100 records.', earned: false, value: 31, target: 100 },
          ],
        },
      }),
    },
  },
};

export const NotificationsPage = {
  render: () => <Notifications />,
  parameters: {
    router: {
      currentUser: member,
      loader: () => ({
        notifications: [
          { id: 'n1', message: 'Pixel Moss added a game: Moss Garden', path: '/game/g2', created_at: '2026-11-06T10:12:00.000Z', read: false },
          { id: 'n2', message: 'Nantes Game Jam changed its dates', path: '/event/e1', created_at: '2026-11-02T08:40:00.000Z', read: true },
        ],
      }),
    },
  },
  play: hasH1(),
};

export const NotificationsPageEmpty = {
  render: () => <Notifications />,
  parameters: { router: { currentUser: member, loader: () => ({ notifications: [] }) } },
};

export const OpportunitiesPage = {
  render: () => <Opportunities />,
  parameters: {
    router: {
      root: { features: { opportunities: true } },
      loader: () => ({
        currentUser: null,
        opportunities: [
          { id: 'o1', kind: 'job', title: 'Gameplay programmer', about: 'Unity, C#.', city: 'Nantes', country_code: 'FR', remote: false, link: 'https://example.com/jobs/1', ends_at: '2026-12-15T00:00:00.000Z', author_id: 'p2' },
        ],
        facets: { countries: facets.countries },
        selected: {},
      }),
    },
  },
  play: hasH1(),
};

export const NewOpportunityPage = {
  render: () => <NewOpportunity />,
  parameters: {
    router: {
      currentUser: member,
      root: { features: { opportunities: true } },
      loader: () => ({ target: { name: 'Pixel Moss', countryCode: 'FR' } }),
    },
  },
  play: hasH1(),
};

export const RecentOrgsPage = {
  render: () => <Orgs />,
  parameters: { router: { loader: () => ({ orgs: [...studios, ...associations], currentUser: null }) } },
  play: hasH1(),
};

export const SigninPage = {
  render: () => <Signin />,
  parameters: { router: { loader: () => ({ devSignIn: false }) } },
  play: hasH1(),
};

export const WelcomePage = {
  render: () => <Welcome />,
  parameters: {
    router: {
      currentUser: member,
      loader: () => ({ currentUser: { ...member, email: 'camille@example.com', canEdit: true } }),
    },
  },
  play: hasH1(),
};

export const ProfileEditPage = {
  render: () => <ProfileEdit />,
  parameters: {
    router: {
      currentUser: member,
      loader: () => ({
        currentUser: { ...member, email: 'camille@example.com', last_name: 'Martin', about: 'Makes small games in Nantes.' },
      }),
    },
  },
  play: hasH1(),
};
