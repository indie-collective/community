import { expect, test, MEMBER, signIn, waitForHydration } from './helpers';

// #320: the feedback widget files a GitHub issue, with a screenshot. A local
// stand-in plays GitHub's API.

const issues = [];
let server;
test.beforeAll(async () => {
  const { createServer } = await import('node:http');
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (req.method === 'POST' && req.url === '/repos/indie-collective/community/issues') {
        issues.push({ auth: req.headers.authorization, ...JSON.parse(body) });
        const number = 1000 + issues.length;
        res
          .writeHead(201, { 'Content-Type': 'application/json' })
          .end(JSON.stringify({ number, html_url: `https://github.com/indie-collective/community/issues/${number}` }));
        return;
      }
      res.writeHead(404).end();
    });
  });
  await new Promise((resolve) => server.listen(3192, '127.0.0.1', resolve));
});
test.afterAll(() => new Promise((resolve) => server.close(resolve)));

test('a member reports a bug from any page, with a screenshot, as a labelled GitHub issue', async ({ page }) => {
  const title = `The map is blank ${Date.now() % 100000}`;
  await signIn(page, MEMBER);
  await page.goto('/about');
  await waitForHydration(page);
  await page.getByRole('button', { name: 'Feedback' }).click();
  const dialog = page.getByRole('dialog', { name: 'Report a bug or suggest a feature' });
  // #376: no screenshot until asked for; what's typed stays while it's taken.
  await expect(dialog.getByRole('img', { name: 'Screenshot of this page' })).toHaveCount(0);
  await dialog.getByLabel('Title').fill(title);
  await dialog.getByRole('button', { name: 'Add a screenshot of this page' }).click();
  const preview = dialog.getByRole('img', { name: 'Screenshot of this page' });
  await expect(preview).toBeVisible();
  await expect(dialog.getByLabel('Title')).toHaveValue(title);
  // Without the widget: the dialog's backdrop, which darkens the whole page,
  // would make the image's corners dark; the page there is light.
  const corner = await preview.evaluate(async (img) => {
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    const [r, g, b, a] = context.getImageData(2, 2, 1, 1).data;
    return a === 255 ? (r + g + b) / 3 : -a;
  });
  expect(corner).toBeGreaterThan(200);
  await dialog.getByLabel('What happened, and what you expected').fill('Nothing shows on /places.');
  await dialog.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(dialog.getByRole('link', { name: /^issue #\d+$/ })).toHaveAttribute('href', /github\.com\/indie-collective\/community\/issues\/\d+/);

  const issue = issues.find((candidate) => candidate.title === title);
  expect(issue.auth).toBe('Bearer e2e-github-token');
  expect(issue.labels).toEqual(['bug', 'needs-triage']);
  expect(issue.body).toContain('Nothing shows on /places.');
  expect(issue.body).toMatch(/- Page: http:\/\/localhost:\d+\/about/);
  expect(issue.body).toContain('- Sent by: @harness-member');
  // The screenshot is stored and linked.
  const screenshot = /!\[Screenshot\]\((\S+)\)/.exec(issue.body)[1];
  const stored = await page.request.get(new URL(screenshot).pathname);
  expect(stored.headers()['content-type']).toBe('image/png');
});

test('a feature request can leave the screenshot out; visitors are asked to sign in', async ({ page }) => {
  await page.goto('/about');
  await waitForHydration(page);
  await page.getByRole('button', { name: 'Feedback' }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: 'Sign in' })).toBeVisible();

  const title = `Dark maps please ${Date.now() % 100000}`;
  await signIn(page, MEMBER);
  await page.goto('/about');
  await waitForHydration(page);
  await page.getByRole('button', { name: 'Feedback' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Feature request').click();
  await dialog.getByLabel('Title').fill(title);
  await dialog.getByLabel('What you’d like, and why').fill('Maps that follow dark mode.');
  // Taken, then removed: sent without one.
  await dialog.getByRole('button', { name: 'Add a screenshot of this page' }).click();
  await dialog.getByRole('button', { name: 'Remove the screenshot' }).click();
  await expect(dialog.getByRole('img', { name: 'Screenshot of this page' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(dialog.getByText(/^Thanks!/)).toBeVisible();
  const issue = issues.find((candidate) => candidate.title === title);
  expect(issue.labels).toEqual(['enhancement', 'needs-triage']);
  expect(issue.body).not.toContain('![Screenshot]');
});
