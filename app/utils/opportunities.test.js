import { describe, expect, it } from 'vitest';

import { parseOpportunity } from './opportunities';

const form = (values) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};
const now = new Date('2026-10-28T12:00:00Z');

describe('parseOpportunity', () => {
  it('reads a posted opportunity, ending at the end of its day', () => {
    expect(
      parseOpportunity(form({ kind: 'job', title: ' Junior dev ', ends_at: '2026-12-01', remote: 'on', country_code: 'fr' }), now)
    ).toEqual({
      kind: 'job',
      title: 'Junior dev',
      about: null,
      remote: true,
      city: null,
      countryCode: 'FR',
      endsAt: new Date('2026-12-01T23:59:59Z'),
    });
  });

  it('refuses what is missing, past, or longer than three months', () => {
    expect(parseOpportunity(form({ kind: 'nope', title: 'x', ends_at: '2026-12-01' }), now).error).toBe('Choose what it is.');
    expect(parseOpportunity(form({ kind: 'job', title: '', ends_at: '2026-12-01' }), now).error).toBe('Give it a title.');
    expect(parseOpportunity(form({ kind: 'job', title: 'x', ends_at: '2026-10-01' }), now).error).toBe('It must end in the future.');
    expect(parseOpportunity(form({ kind: 'job', title: 'x', ends_at: '2027-03-01' }), now).error).toBe('It can stay up for 92 days at most.');
  });
});
