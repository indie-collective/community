// The administration pages, as an admin sees them.
import { expect, within } from 'storybook/test';

import ApiDocs from '../../routes/api/docs';
import Bluesky from '../../routes/admin/bluesky';
import Changes from '../../routes/admin/changes';
import Duplicates from '../../routes/admin/duplicates';
import Merge from '../../routes/admin/duplicates.merge';
import Flags from '../../routes/admin/flags';
import Missing from '../../routes/admin/missing';
import Sources from '../../routes/admin/sources';
import Tags from '../../routes/admin/tags';
import Users from '../../routes/admin/users';
import { GAPS } from '../../utils/missions';
import { admin, games, member } from '../fixtures';

export default {
  title: 'Pages/Admin',
  parameters: { layout: 'fullscreen' },
};

const hasH1 = async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole('heading', { level: 1 })).toBeVisible();
};

const page = (Component, path, url, data) => ({
  render: () => <Component />,
  parameters: { router: { path, url, currentUser: admin, loader: () => data } },
  play: hasH1,
});

export const UsersPage = page(Users, 'admin/users', '/admin/users', {
  currentUser: admin,
  nbOfPeople: 2,
  lastChanges: [],
  people: [
    { id: 'p1', created_at: '2025-02-01T10:00:00.000Z', avatar: null, username: 'member', first_name: 'Camille', last_name: 'Martin', email: 'camille@example.com', isAdmin: false, role: 'member', bluesky_linked: true },
    { id: 'p9', created_at: '2024-06-12T10:00:00.000Z', avatar: null, username: 'admin', first_name: 'Alex', last_name: 'Durand', email: 'alex@example.com', isAdmin: true, role: 'admin', bluesky_linked: false },
  ],
});

const change = (id, operation, kind, record, fields, author = member) => ({
  id,
  operation,
  kind,
  record_id: record.id,
  record,
  fields,
  author,
  undo_of: null,
  created_at: '2026-11-06T09:30:00.000Z',
});

export const ChangesPage = page(Changes, 'admin/changes', '/admin/changes', {
  changes: [
    change('c1', 'create', 'game', { id: 'g2', name: 'Moss Garden', path: '/game/g2' }, []),
    change('c2', 'update', 'organization', { id: 's1', name: 'Pixel Moss', path: '/org/s1' }, ['about', 'site']),
  ],
  hasMore: false,
  person: null,
  page: 1,
  size: [{ format: 2, rows: 18240, bytes: 3_400_000 }],
});

export const DuplicatesPage = page(Duplicates, 'admin/duplicates', '/admin/duplicates', {
  kind: 'game',
  pairs: [
    {
      a: { id: 'g2', name: 'Moss Garden', path: '/game/g2', site: 'https://mossgarden.example' },
      b: { id: 'g7', name: 'Moss Gardens', path: '/game/g7', site: null },
      reasons: ['Similar names'],
      flagged: false,
    },
  ],
});

export const MergePage = page(Merge, 'admin/duplicates/merge', '/admin/duplicates/merge?kind=game&keep=g2&other=g7', {
  fields: [
    ['name', 'Name'],
    ['site', 'Website'],
  ],
  records: [
    { id: 'g2', name: 'Moss Garden', path: '/game/g2', values: { name: ['Moss Garden'], site: ['https://mossgarden.example'] } },
    { id: 'g7', name: 'Moss Gardens', path: '/game/g7', values: { name: ['Moss Gardens'], site: [] } },
  ],
  // The record each field comes from, by index.
  choices: { name: 0, site: 0 },
});

export const FlagsPage = page(Flags, 'admin/flags', '/admin/flags', {
  flags: [
    { key: 'opportunities', label: 'Opportunities', description: 'Jobs and calls on organisation pages.', state: 'admins' },
    { key: 'breton', label: 'Breton', description: 'The interface in Breton (a draft).', state: 'off' },
  ],
});

const counts = Object.fromEntries(
  Object.entries(GAPS).map(([kind, gaps]) => [kind, Object.fromEntries(gaps.map(({ key }, i) => [key, (i + 1) * 13]))])
);

export const MissingPage = page(Missing, 'admin/missing', '/admin/missing', {
  counts,
  kind: 'game',
  gap: 'about',
  page: 1,
  hasMore: false,
  records: games.slice(0, 3).map(({ id, name }) => ({ id, name, path: `/game/${id}` })),
  flags: [
    { record_id: 'g3', kind: 'game', name: 'Iron Tide', path: '/game/g3', reason: 'The site is down', person_id: 'p1', username: 'member' },
  ],
});

export const SourcesPage = page(Sources, 'admin/sources', '/admin/sources', {
  sources: [
    { id: 'r1', kind: 'game', source: 'steam', url: 'https://store.steampowered.com/app/1', fetched_at: '2026-11-05T12:00:00.000Z', filled: ['about', 'site'], error: null, record: { name: 'Moss Garden', path: '/game/g2' } },
    { id: 'r2', kind: 'organization', source: 'website', url: 'https://pixelmoss.example', fetched_at: '2026-11-04T12:00:00.000Z', filled: [], error: 'Timed out', record: { name: 'Pixel Moss', path: '/org/s1' } },
  ],
});

export const TagsPage = page(Tags, 'admin/tags', '/admin/tags', {
  tags: [
    { id: 't1', name: 'Platformer', _count: { game_tag: 120 } },
    { id: 't2', name: 'platformer ', _count: { game_tag: 2 } },
  ],
});

export const BlueskyPage = page(Bluesky, 'admin/bluesky', '/admin/bluesky', {
  summary: { text: 'This week on the Indie Collective community: 4 new games, 2 studios and 3 events.', url: 'https://community.indieco.xyz/' },
});

export const ApiDocsPage = page(ApiDocs, 'api/docs', '/api/docs', { origin: 'https://community.indieco.xyz' });
