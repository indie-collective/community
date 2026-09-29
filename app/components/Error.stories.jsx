import { expect, within } from 'storybook/test';

import Error from './Error';

export default { title: 'Pages/Error', component: Error };

export const NotFound = {
  args: { statusCode: 404 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not Found')).toBeVisible();
    await expect(canvas.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  },
};

export const ServerError = { args: { statusCode: 500 } };
