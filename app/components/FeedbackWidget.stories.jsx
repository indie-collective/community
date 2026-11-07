import { expect, within } from 'storybook/test';

import FeedbackWidget from './FeedbackWidget';
import { member } from '../stories/fixtures';

export default {
  title: 'Layout/FeedbackWidget',
  component: FeedbackWidget,
  parameters: { layout: 'fullscreen', router: { currentUser: member } },
  decorators: [(Story) => <div style={{ height: 480 }}><Story /></div>],
};

export const Default = {
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole('button', { name: /feedback/i })).toBeVisible();
  },
};
