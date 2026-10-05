import { describe, expect, it } from 'vitest';

import { buildRobots, buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  const xml = buildSitemap('https://community.indieco.xyz', {
    countries: ['FR', 'JP'],
    games: [{ id: 'g1', updated_at: new Date('2026-09-01T10:00:00Z') }],
    orgs: [{ id: 'o1', updated_at: null }],
    events: [{ id: 'e1', updated_at: '2026-08-14T08:00:00Z' }],
  });

  it('lists the main pages, countries, games, organisations and events', () => {
    for (const path of [
      '/',
      '/countries',
      '/country/fr',
      '/country/jp',
      '/game/g1',
      '/org/o1',
      '/event/e1',
    ]) {
      expect(xml).toContain(`<loc>https://community.indieco.xyz${path}</loc>`);
    }
    expect(
      xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')
    ).toBe(true);
  });

  it('dates entries that have one', () => {
    expect(xml).toContain(
      '<loc>https://community.indieco.xyz/game/g1</loc><lastmod>2026-09-01</lastmod>'
    );
    expect(xml).toContain(
      '<loc>https://community.indieco.xyz/org/o1</loc></url>'
    );
  });

  it('escapes the origin', () => {
    expect(buildSitemap('https://a.test/?x=1&y=2', {})).toContain(
      'https://a.test/?x=1&amp;y=2/'
    );
  });
});

describe('buildRobots', () => {
  it('points to the sitemap and keeps crawlers out of account pages', () => {
    const robots = buildRobots('https://community.indieco.xyz');
    expect(robots).toContain(
      'Sitemap: https://community.indieco.xyz/sitemap.xml'
    );
    expect(robots).toContain('Disallow: /admin/');
    expect(robots).not.toMatch(/^Disallow: \/$/m);
  });
});
