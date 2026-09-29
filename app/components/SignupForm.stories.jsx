import { expect, userEvent, within } from 'storybook/test';

import SignupForm from './SignupForm';

export default {
  title: 'Forms/SignupForm',
  component: SignupForm,
  decorators: [(Story) => <div style={{ maxWidth: 400 }}><Story /></div>],
};

// #146/#170: required markers on the four required fields, and client-side
// validation still reaches Field.ErrorText.
export const PasswordMismatch = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const required = [...canvasElement.querySelectorAll('label')].filter((l) =>
      l.textContent.includes('*')
    );
    await expect(required).toHaveLength(4);

    await userEvent.type(canvas.getByLabelText(/first name/i), 'Jean-Michel');
    await userEvent.type(canvas.getByLabelText(/^email/i), 'jmj@indieco.test');
    await userEvent.type(canvas.getByLabelText(/^password\*?$/i), 'first-password-1');
    await userEvent.type(canvas.getByLabelText(/confirmation/i), 'second-password-2');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign Up' }));
    await expect(await canvas.findByText('Passwords must match')).toBeVisible();
  },
};
