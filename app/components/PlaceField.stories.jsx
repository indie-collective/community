import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import PlaceField from './PlaceField';

export default {
  title: 'Forms/PlaceField',
  component: PlaceField,
  decorators: [(Story) => <div style={{ maxWidth: 460, minHeight: 360 }}><Story /></div>],
};

const Picker = (props) => {
  const [place, setPlace] = useState(props.value ?? { label: '', value: null });
  return (
    <PlaceField
      {...props}
      value={place}
      onChange={setPlace}
      onClear={() => setPlace({ label: '', value: null })}
    />
  );
};

// Suggestions come from Mapbox, so searching needs a connection.
export const Empty = { render: () => <Picker placeholder="Rennes, France" /> };

// A pick is a row, and Change searches again.
export const Picked = {
  render: () => (
    <Picker
      value={{ label: 'Nantes, Loire-Atlantique, France', value: { city: 'Nantes' } }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nantes')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Change' }));
    await expect(canvas.getByRole('combobox')).toBeVisible();
  },
};

export const Dark = { ...Picked, globals: { colorMode: 'dark' } };
