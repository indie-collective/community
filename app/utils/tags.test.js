import { describe, expect, it } from 'vitest';

import { normalizeTagName, parseTagList } from './tags';

describe('normalizeTagName', () => {
  it.each([
    ['  Roguelike ', 'roguelike'],
    ['Point   and\tclick', 'point and click'],
    ["Shoot'em'up", "shoot 'em up"],
    ["beat'em up", "beat 'em up"],
    ['Beat ’em all', "beat 'em all"],
    ['co-op', 'co-op'],
  ])('%j → %j', (input, expected) => {
    expect(normalizeTagName(input)).toBe(expected);
  });
});

describe('parseTagList', () => {
  // #207: a trailing comma made an empty tag; repeats broke the save.
  it('splits on commas, normalises, and drops empty and repeated tags', () => {
    expect(parseTagList('Coop, , Platform ,coop,')).toEqual(['coop', 'platform']);
  });

  it('handles a missing field', () => {
    expect(parseTagList(null)).toEqual([]);
  });
});
