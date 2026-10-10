import { expect, test, MEMBER, signIn } from './helpers';

// ADR 0002: images go to R2, with a thumbnail made in the browser (400px
// high), and are served from /images locally (no CDN_HOST).
test('an uploaded logo is stored with its browser-made thumbnail', async ({ page }) => {
  // A 1200×900 PNG, drawn in the page.
  await page.goto('/about');
  const png = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    context.fillStyle = '#3a7';
    context.fillRect(0, 0, 1200, 900);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return [...new Uint8Array(await blob.arrayBuffer())];
  });

  await signIn(page, MEMBER);
  await page.goto('/orgs/create');
  await page.getByText('Studio', { exact: true }).click();
  const name = `Logo Studio ${Date.now() % 100000}`;
  await page.getByLabel(/^name/i).fill(name);
  await page.locator('input[type="file"][name="logo"]').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png),
  });
  // The thumbnail is ready once its size fields are.
  await expect(page.locator('input[name="logo_width"]')).toHaveValue('1200');
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page).toHaveURL(/\/org\/[0-9a-f-]{36}$/);

  const src = await page.getByRole('heading', { name }).locator('xpath=ancestor::main').locator('img[src^="/images/thumb_"]').first().getAttribute('src');
  const thumbnail = await page.request.get(src);
  expect(thumbnail.status()).toBe(200);
  expect(thumbnail.headers()['content-type']).toMatch(/^image\/(webp|jpeg)$/);
  const original = await page.request.get(src.replace('/thumb_', '/'));
  expect(original.headers()['content-type']).toBe('image/png');

  const size = await page.evaluate(async (url) => {
    const bitmap = await createImageBitmap(await (await fetch(url)).blob());
    return [bitmap.width, bitmap.height];
  }, src);
  expect(size).toEqual([533, 400]);
});
