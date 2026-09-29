import { expect, fn, userEvent, within } from 'storybook/test';

import ActionMenu from './ActionMenu';

const onDelete = fn();

export default {
  title: 'Layout/ActionMenu',
  component: ActionMenu,
  args: { editLink: '/org/1/edit', changesLink: '/org/1/changes', onDelete },
};

// The trigger used to render a <button> inside a <button>; items are links.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button', { name: 'Options' });
    await expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]);

    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('menuitem', { name: 'Edit' })).toHaveAttribute('href', '/org/1/edit');
    await expect(body.getByRole('menuitem', { name: 'History' })).toHaveAttribute('href', '/org/1/changes');
    await userEvent.click(body.getByRole('menuitem', { name: 'Delete' }));
    await expect(onDelete).toHaveBeenCalled();
  },
};
