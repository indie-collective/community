import { expect, waitFor, within } from 'storybook/test';

import { SearchOrgModal } from '../../routes/search-org';
import { studios } from '../fixtures';

export default {
  title: 'Forms/SearchOrgModal',
  component: SearchOrgModal,
  parameters: {
    router: { routes: [{ path: 'search-org', loader: () => studios.slice(0, 3), action: () => studios.slice(0, 3) }] },
  },
};

// Linking a studio or association to a game or event.
export const Open = {
  args: { isOpen: true },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const header = await page.findByText('Find Organization');
    await waitFor(() => expect(header).toBeVisible());
  },
};
