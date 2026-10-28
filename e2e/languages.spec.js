import { expect, test, watchErrors, waitForHydration, ADMIN, signIn } from './helpers';

// #344: the interface in English or French, on the same URLs.

test.describe('a French browser', () => {
  test.use({ locale: 'fr-FR' });

  test('gets the interface in French, the same before and after hydration', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/games', { waitUntil: 'networkidle' });
    expect(await page.locator('html').getAttribute('lang')).toBe('fr');
    await expect(page.getByRole('heading', { name: 'Jeux', level: 1 })).toBeVisible();
    await expect(page.getByText(/à ce jour\.$/)).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'Événements' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'À propos' })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test('the language chosen in the footer is remembered', async ({ page }) => {
  await page.goto('/events');
  await waitForHydration(page);
  await expect(page.getByRole('heading', { name: 'Events', level: 1 })).toBeVisible();
  await page.getByLabel('Language').selectOption('fr');
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { name: 'Événements', level: 1 })).toBeVisible();

  // Still French on another page, until changed back.
  await page.goto('/studios');
  await expect(page.getByRole('heading', { name: 'Studios', level: 1 })).toBeVisible();
  await expect(page.getByText(/Des studios de jeux indépendants/)).toBeVisible();
  await waitForHydration(page);
  await page.getByLabel('Langue').selectOption('en');
  await expect(page.getByText(/Indie game studios around the world/)).toBeVisible();
});

// #373: Breton is a draft until reviewed, so its flag shows it to admins only.
test.describe('a Breton browser', () => {
  test.use({ locale: 'br-FR' });

  test('gets English and no Breton option, until an admin', async ({ page }) => {
    await page.goto('/events');
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
    await expect(page.getByRole('heading', { name: 'Events', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Language').locator('option[value="br"]')).toHaveCount(0);

    await signIn(page, ADMIN);
    await page.goto('/events');
    await waitForHydration(page);
    expect(await page.locator('html').getAttribute('lang')).toBe('br');
    await expect(page.getByRole('heading', { name: 'Darvoudoù', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Yezh').locator('option[value="br"]')).toHaveText('Brezhoneg');
    await page.getByLabel('Yezh').selectOption('en');
    await expect(page.getByRole('heading', { name: 'Events', level: 1 })).toBeVisible();
  });
});
