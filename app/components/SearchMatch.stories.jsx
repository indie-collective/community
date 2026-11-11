import { expect } from 'storybook/test';

import SearchMatch from './SearchMatch';

export default { title: 'Search/SearchMatch', component: SearchMatch };

// #306: why a result matched when it isn't its name, the words marked.
export const Related = {
  args: { kind: 'game', match: { field: 'related', text: 'Made by \u0002Pixel\u0003 Moss' } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('mark')).toHaveTextContent('Pixel');
  },
};

export const About = {
  args: { kind: 'organization', match: { field: 'about', text: 'A small studio making \u0002cozy\u0003 puzzle games in Nantes.' } },
};

export const Dark = { ...Related, globals: { colorMode: 'dark' } };
