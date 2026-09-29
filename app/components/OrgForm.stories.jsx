import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import OrgForm from './OrgForm';

const action = fn(async ({ request }) => {
  const data = await request.formData();
  return Object.fromEntries([...data.entries()].filter(([, v]) => typeof v === 'string'));
});

export default {
  title: 'Forms/OrgForm',
  component: OrgForm,
  parameters: {
    router: {
      action,
      routes: [{ path: 'search-org', loader: () => [] }],
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 500 }}><Story /></div>],
  // The create and edit routes post the form; without this it submits as GET.
  args: { method: 'post' },
};

// #169: the type selector crashed (a v2 useRadio leftover); it is a v3
// RadioCard now and must still submit `type`.
export const CreateAssociation = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Association'));
    await userEvent.type(canvas.getByLabelText(/name/i), 'Indie Collective');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(action).toHaveBeenCalled());
    const result = await action.mock.results.at(-1).value;
    await expect(result.type).toBe('association');
    await expect(result.name).toBe('Indie Collective');
  },
};

export const Dark = { globals: { colorMode: 'dark' } };
