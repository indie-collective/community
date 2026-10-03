import { describe, expect, it } from 'vitest';

import { safeRedirectPath } from './safeRedirect';

describe('safeRedirectPath', () => {
  it.each(['/profile', '/orgs/create?type=studio', '/games?tags=a&tags=b#top'])('keeps the same-site path %s', (path) => {
    expect(safeRedirectPath(path)).toBe(path);
  });

  // #178: prev must not become an open redirect.
  it.each([
    null,
    undefined,
    '',
    'profile',
    '//evil.example',
    '/\\evil.example',
    '/%5Cevil.example',
    'https://evil.example',
    'javascript:alert(1)',
    '/\t/evil.example',
  ])('falls back for %j', (value) => {
    expect(safeRedirectPath(value)).toBe('/');
    expect(safeRedirectPath(value, '/welcome')).toBe('/welcome');
  });
});
