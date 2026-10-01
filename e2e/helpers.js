import { expect, test as base } from '@playwright/test';

// page.goto that also waits for React to hydrate the page. Server-rendered
// controls are visible straight away, but clicks on them do nothing until
// hydration attaches the handlers, which on CI runners can take long enough
// for a test to click first. React marks hydrated elements with a
// __reactFiber$ property; <main> is the app shell's, present on every page.
export const waitForHydration = (page) =>
  page.waitForFunction(() => {
    const main = document.querySelector('main');
    return !!main && Object.keys(main).some((key) => key.startsWith('__reactFiber'));
  });

export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await waitForHydration(page);
      return response;
    };
    await use(page);
  },
});

export { expect };

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
