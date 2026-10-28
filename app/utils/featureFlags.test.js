import { describe, expect, it } from 'vitest';

import { flagState, isFlagState, isOnFor } from './featureFlags';

describe('feature flags', () => {
  it('falls back to the default when nothing valid is stored', () => {
    expect(flagState('opportunities', null)).toBe('off');
    expect(flagState('opportunities', 'maybe')).toBe('off');
    expect(flagState('opportunities', 'on')).toBe('on');
    expect(flagState('unknown', 'on')).toBe('off');
  });

  it('shows "admins" flags to admins only', () => {
    expect(isOnFor('on', null)).toBe(true);
    expect(isOnFor('admins', null)).toBe(false);
    expect(isOnFor('admins', { isAdmin: false })).toBe(false);
    expect(isOnFor('admins', { isAdmin: true })).toBe(true);
    expect(isOnFor('off', { isAdmin: true })).toBe(false);
  });

  it('knows the states', () => {
    expect(['off', 'admins', 'on'].every(isFlagState)).toBe(true);
    expect(isFlagState('yes')).toBe(false);
  });
});
