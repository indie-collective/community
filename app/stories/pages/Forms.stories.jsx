// The pages that add and edit records.
import { expect, within } from 'storybook/test';

import EventEdit from '../../routes/event.$id.edit';
import EventsCreate from '../../routes/events.create';
import GameEdit from '../../routes/game.$id.edit';
import GamesCreate from '../../routes/games.create';
import OrgEdit from '../../routes/org.$id.edit';
import OrgsCreate from '../../routes/orgs.create';
import VenueEdit from '../../routes/venue.$id.edit';
import { PLACES, events, games, member, studios } from '../fixtures';

const pickers = [
  { path: 'duplicates', loader: () => ({ matches: [] }) },
  { path: 'search-org', loader: () => [] },
  { path: 'search-event', loader: () => [] },
  { path: 'search-game', loader: () => [] },
];

export default {
  title: 'Pages/Forms',
  parameters: { layout: 'fullscreen' },
};

const hasH1 = async ({ canvasElement }) => {
  await expect(await within(canvasElement).findByRole('heading', { level: 1 })).toBeVisible();
};

const page = (Component, path, url, data) => ({
  render: () => <Component />,
  parameters: { router: { path, url, currentUser: member, routes: pickers, loader: () => ({ currentUser: member, ...data }) } },
  play: hasH1,
});

export const AddGame = page(GamesCreate, 'games/create', '/games/create', {});
export const EditGame = page(GameEdit, 'game/:id/edit', '/game/g1/edit', {
  game: { ...games[0], about: 'A narrative adventure.', game_entity: [], game_tag: games[0].tags.map((tag) => ({ tag })), game_image: [] },
});
export const AddOrganisation = page(OrgsCreate, 'orgs/create', '/orgs/create', {});
export const EditOrganisation = page(OrgEdit, 'org/:id/edit', '/org/s1/edit', {
  org: { ...studios[0], about: 'A small studio.', site: '', game_entity: [] },
});
export const AddEvent = page(EventsCreate, 'events/create', '/events/create', {});
export const EditEvent = page(EventEdit, 'event/:id/edit', '/event/e1/edit', {
  event: { ...events[0], about: 'A weekend jam.', game_event: [], entity_event: [] },
});
export const EditVenue = page(VenueEdit, 'venue/:id/edit', '/venue/v1/edit', {
  venue: { id: 'v1', slug: 'le-lieu-unique', name: 'Le Lieu Unique', about: '', site: '', location: PLACES.nantes },
});
