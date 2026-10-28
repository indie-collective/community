import { expect, fn, userEvent, within } from 'storybook/test';

import ActionMenu from './ActionMenu';

const onDelete = fn();

export default {
  title: 'Layout/ActionMenu',
  component: ActionMenu,
  args: { editLink: '/org/1/edit', onDelete },
};

// Edit in plain sight; Delete (admins only) in the "More actions" menu, whose
// trigger is one button (it used to nest a <button> in a <button>).
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/org/1/edit'
    );
    const buttons = canvas.getAllByRole('button', { name: 'More actions' });
    await expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]);

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Delete' }));
    await expect(onDelete).toHaveBeenCalled();
  },
};
