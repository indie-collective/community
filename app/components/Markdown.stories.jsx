import { expect, within } from 'storybook/test';

import Markdown from './Markdown';

export default {
  title: 'Content/Markdown',
  component: Markdown,
  args: {
    value: [
      'Indie studio based in **Nantes**, making cosy puzzle games.',
      '',
      '- Founded in 2019',
      '- 6 people',
      '',
      'More on https://example.com and our [press kit](https://example.com/press).',
      '',
      '> A quote from a happy player.',
    ].join('\n'),
  },
};

// #172: descriptions rendered nothing (Markdown was stubbed to return null).
// Links go off-site, so they open in a new tab.
export const Description = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/cosy puzzle games/)).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    for (const link of canvas.getAllByRole('link')) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  },
};

export const Empty = {
  args: { value: '' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('p, ul, ol, blockquote')).toBeNull();
  },
};
