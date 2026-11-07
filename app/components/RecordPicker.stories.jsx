import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import RecordPicker, {
  LinkPicker,
  ORGANIZATION_CREATE,
  describeEvent,
} from './RecordPicker';
import { studios } from '../stories/fixtures';

const found = studios.slice(0, 3).map(({ id, name, slug, type, location }) => ({
  id,
  name,
  slug,
  type,
  city: location.city,
}));
const onSelect = fn();
const onCreate = fn();

export default {
  title: 'Forms/RecordPicker',
  component: RecordPicker,
  decorators: [(Story) => <div style={{ maxWidth: 420, minHeight: 360 }}><Story /></div>],
  parameters: {
    router: {
      routes: [
        { path: 'search-org', loader: () => found },
        {
          path: 'search-event',
          loader: () => [
            { id: 'e0', name: 'Nantes Game Jam 2025', starts_at: '2025-11-14T17:00:00.000Z', time_zone: 'Europe/Paris' },
          ],
        },
      ],
    },
  },
  // Passed here, not as an arg: Storybook drops functions nested in args.
  render: (args) => <RecordPicker createOptions={ORGANIZATION_CREATE} {...args} />,
  args: {
    source: '/search-org',
    label: 'Studio',
    onSelect,
    onCreate,
  },
};

// Type, and the results come with what and where; Enter picks the first.
export const Searching = {
  play: async ({ canvasElement }) => {
    onSelect.mockClear();
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('combobox', { name: 'Studio' }), 'Pix');
    await expect(await canvas.findByText('Studio · Nantes')).toBeVisible();
    await expect(await canvas.findByText('Add “Pix” as a studio')).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' })));
  },
};

// Not there: add it.
export const Adding = {
  play: async ({ canvasElement }) => {
    onCreate.mockClear();
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('combobox', { name: 'Studio' }), 'Pix');
    await userEvent.click(await canvas.findByText('Add “Pix” as an association'));
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith({ name: 'Pix', type: 'association' }));
  },
};

const Picked = () => {
  const [value, setValue] = useState(found[0]);
  return <RecordPicker source="/search-org" label="Studio" value={value} onClear={() => setValue(null)} onSelect={setValue} />;
};

// A pick shows as a row, and Change searches again.
export const Chosen = {
  render: () => <Picked />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Change' }));
    await expect(canvas.getByRole('combobox', { name: 'Studio' })).toBeVisible();
  },
};

export const Events = {
  args: { source: '/search-event', label: 'Previous edition', describe: describeEvent, createOptions: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('combobox'), 'Nantes');
    await expect(await canvas.findByText(/Event · Nov 14/)).toBeVisible();
  },
};

// On a record's page: a + that opens it in a popover.
export const InAPopover = {
  render: (args) => (
    <LinkPicker {...args} createOptions={ORGANIZATION_CREATE} label="Add an author to the game" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add an author to the game' }));
    const page = within(canvasElement.ownerDocument.body);
    const box = await page.findByRole('combobox');
    await expect(box).toHaveFocus();
    // Picking a result picks it and closes the popover.
    onSelect.mockClear();
    await userEvent.type(box, 'Pix');
    await userEvent.click(await page.findByRole('option', { name: /Lantern Bay Games/ }));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 's2' })));
    await waitFor(() => expect(page.queryByRole('combobox')).toBeNull());
  },
};

export const Dark = { ...Searching, globals: { colorMode: 'dark' } };
