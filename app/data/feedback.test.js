import { expect, it, vi } from 'vitest';

vi.mock('cloudflare:workers', () => ({ env: {} }));
vi.mock('./kv.server', () => ({ getValue: vi.fn(), setValue: vi.fn() }));

const { issueBody } = await import('./feedback.server');

it('says where, on what and by whom, under the description and screenshot', () => {
  expect(
    issueBody({
      description: ' The map is blank. ',
      page: 'https://community.indieco.xyz/places',
      browser: 'Firefox',
      viewport: '390×844',
      username: 'jam',
      screenshotUrl: 'https://cdn/feedback/x.png',
    })
  ).toBe(
    'The map is blank.\n\n![Screenshot](https://cdn/feedback/x.png)\n\n---\n- Page: https://community.indieco.xyz/places\n- Browser: Firefox\n- Viewport: 390×844\n- Sent by: @jam on the site\'s feedback widget'
  );
});
