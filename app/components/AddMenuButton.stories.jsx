import { expect, userEvent, waitFor, within } from 'storybook/test';

import AddMenuButton from './AddMenuButton';

export default {
  title: 'Layout/AddMenuButton',
  component: AddMenuButton,
  parameters: { router: { currentUser: { id: 'p1', username: 'member' } } },
};

// The header's +: what a member can add.
export const Open = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    const page = within(canvasElement.ownerDocument.body);
    const item = await page.findByRole('menuitem', { name: /game/i });
    await expect(item).toHaveAttribute('href', '/games/create');
    // Visible once the menu has finished opening.
    await waitFor(() => expect(item).toBeVisible());
  },
};
