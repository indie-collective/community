import { beforeAll, describe, expect, it } from 'vitest';

import { calendarToken, personFromCalendarToken } from './calendarToken.server';

beforeAll(() => {
  process.env.SESSION_SECRET ??= 'test-secret';
});

describe('calendar tokens', () => {
  it('lead back to their member', async () => {
    expect(await personFromCalendarToken(await calendarToken('p1'))).toBe('p1');
  });

  it("can't be made for someone else or tampered with", async () => {
    const token = await calendarToken('p1');
    const [, sig] = token.split('.');
    expect(await personFromCalendarToken(`p2.${sig}`)).toBeNull();
    expect(await personFromCalendarToken(`${token}x`)).toBeNull();
    expect(await personFromCalendarToken('p1')).toBeNull();
    expect(await personFromCalendarToken(undefined)).toBeNull();
  });
});
