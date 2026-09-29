import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import SigninForm from './SigninForm';

const action = fn(async ({ request }) => {
  const data = await request.formData();
  return { email: data.get('email') };
});

export default {
  title: 'Forms/SigninForm',
  component: SigninForm,
  parameters: { router: { action } },
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
};

// #170: required fields show their marker; the form posts the email.
export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText(/email/i);
    await expect(email).toBeRequired();
    await expect(canvasElement.querySelector('label').textContent).toContain('*');

    await userEvent.type(email, 'someone@indieco.test');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(action).toHaveBeenCalled());
    const { request } = action.mock.calls.at(-1)[0];
    await expect(request.method).toBe('POST');
  },
};

export const Dark = { globals: { colorMode: 'dark' } };
