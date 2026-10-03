import { afterEach, describe, expect, it } from 'vitest';

import getOrigin from './origin.server';

const request = new Request('http://internal:3000/game/1');

describe('getOrigin', () => {
  afterEach(() => {
    delete process.env.BASE_URL;
  });

  it("uses the request's origin by default", () => {
    expect(getOrigin(request)).toBe('http://internal:3000');
  });

  it('prefers BASE_URL, without a trailing slash', () => {
    process.env.BASE_URL = 'https://community.indieco.xyz/';
    expect(getOrigin(request)).toBe('https://community.indieco.xyz');
  });
});
