import { expect, within } from 'storybook/test';

import OpportunityList from './OpportunityList';
import { member } from '../stories/fixtures';

const opportunities = [
  {
    id: 'o1',
    kind: 'job',
    title: 'Gameplay programmer',
    about: 'Unity, C#. Two years on a shipped game.',
    city: 'Nantes',
    country_code: 'FR',
    remote: false,
    link: 'https://example.com/jobs/1',
    ends_at: '2026-12-15T00:00:00.000Z',
    author_id: 'p1',
  },
  {
    id: 'o2',
    kind: 'call',
    title: 'Showcase submissions for Brussels Games Week',
    about: 'Playable demos, any platform.',
    remote: true,
    link: 'https://example.com/call',
    ends_at: '2026-11-20T00:00:00.000Z',
    author_id: 'p2',
  },
];

export default {
  title: 'Opportunities/OpportunityList',
  component: OpportunityList,
  args: { opportunities },
};

export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByTestId('opportunity')).toHaveLength(2);
  },
};

// Their own get edit and delete.
export const Author = { args: { currentUser: member } };

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
