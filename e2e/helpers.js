import { expect, test as base } from '@playwright/test';

// page.goto that also waits for React to hydrate the page. Server-rendered
// controls are visible straight away, but clicks on them do nothing until
// hydration attaches the handlers, which on CI runners can take long enough
// for a test to click first. React marks hydrated elements with a
// __reactFiber$ property; <main> is the app shell's, present on every page.
export const waitForHydration = (page) =>
  page.waitForFunction(() => {
    const main = document.querySelector('main');
    return (
      !!main && Object.keys(main).some((key) => key.startsWith('__reactFiber'))
    );
  });

function gotoHydrated(page) {
  const goto = page.goto.bind(page);
  page.goto = async (url, options) => {
    const response = await goto(url, options);
    await waitForHydration(page);
    return response;
  };
  return page;
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await use(gotoHydrated(page));
  },
  // A page of its own (another person, signed in apart), whose goto waits for
  // hydration like `page`'s. Closed after the test, even one that timed out,
  // when closing can fail as Playwright has already disposed of it.
  newPage: async ({ browser }, use) => {
    const pages = [];
    await use(async () => {
      const page = gotoHydrated(await browser.newPage());
      pages.push(page);
      return page;
    });
    await Promise.allSettled(pages.map((page) => page.close()));
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
      /Hydration failed|mounting a new|cannot be a descendant|does not recognize|non-boolean attribute/.test(
        text
      )
    ) {
      errors.push(text.split('\n')[0]);
    }
  });
  return errors;
}

// A route's loader data from a `.data` response (React Router's
// turbo-stream encoding: a flat array, values referenced by index), enough
// for plain data: objects, arrays, strings, numbers and booleans.
export function decodeRouteData(text, routeId) {
  const values = JSON.parse(text.split('\n')[0]);
  const decoded = new Map();
  const at = (index) => {
    if (index < 0) return { '-6': true, '-7': false }[index] ?? null;
    if (decoded.has(index)) return decoded.get(index);
    const value = values[index];
    let result = value;
    if (Array.isArray(value) && typeof value[0] !== 'string') {
      result = [];
      decoded.set(index, result);
      for (const item of value) result.push(at(item));
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result = {};
      decoded.set(index, result);
      for (const [key, item] of Object.entries(value)) {
        result[values[Number(key.slice(1))]] = at(item);
      }
    }
    decoded.set(index, result);
    return result;
  };
  return at(0)[routeId]?.data;
}
