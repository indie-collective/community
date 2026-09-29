import { expect, within } from 'storybook/test';

import ProfileForm from './ProfileForm';

export default {
  title: 'Forms/ProfileForm',
  component: ProfileForm,
  parameters: {
    router: {
      routes: [
        { path: 'check-username-availability', loader: () => ({ available: true }) },
      ],
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 500 }}><Story /></div>],
  args: {
    defaultData: {
      email: 'member@indieco.test',
      username: 'member',
      first_name: 'Jean-Michel',
      last_name: 'Jam',
      about: 'Makes games.',
    },
  },
};

// #170: filled inputs must contrast with the page. v3's `subtle` variant used
// the page's own gray, so fields looked like bare text.
// The colour the app shell paints behind page content (root.jsx AppShell).
const shellBackground = (dark) => {
  const probe = document.createElement('div');
  probe.style.background = `var(--chakra-colors-gray-${dark ? 900 : 100})`;
  document.body.append(probe);
  const colour = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return colour;
};

const fieldContrasts = async ({ canvasElement, globals }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText(/first name/i);
  const page = shellBackground(globals.colorMode === 'dark');
  await expect(getComputedStyle(input).backgroundColor).not.toBe(page);
  await expect(input).toHaveValue('Jean-Michel');
};

export const Light = { play: fieldContrasts };
export const Dark = { play: fieldContrasts, globals: { colorMode: 'dark' } };
