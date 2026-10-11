import { describe, expect, it } from 'vitest';

import { webUrl } from './url';

describe('webUrl', () => {
  it.each([
    ['https://stunfest.fr/billetterie', 'https://stunfest.fr/billetterie'],
    ['stunfest.fr', 'https://stunfest.fr/'],
    ['  http://example.com  ', 'http://example.com/'],
    ['', null],
    [null, null],
    ['javascript:alert(1)', null],
    ['ftp://files.example.com', null],
    ['not a url', null],
    ['localhost', null],
  ])('%j → %j', (input, expected) => {
    expect(webUrl(input)).toBe(expected);
  });
});
