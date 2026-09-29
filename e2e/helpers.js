import { expect } from '@playwright/test';

export const MEMBER = 'harness-member@indieco.test';
export const ADMIN = 'harness-admin@indieco.test';

// Signs in through the development-only form strategy (email, no password).
export async function signIn(page, email) {
  const response = await page.request.post('/signin', {
    form: { email, password: '' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
}

// Collects errors that mean the page didn't hydrate or render properly.
export function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (
      message.type() === 'error' &&
      /Hydration failed|mounting a new|cannot be a descendant|does not recognize|non-boolean attribute/.test(text)
    ) {
      errors.push(text.split('\n')[0]);
    }
  });
  return errors;
}
