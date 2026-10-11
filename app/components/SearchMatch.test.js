import { describe, expect, it } from 'vitest';

import { markedParts } from './SearchMatch';

describe('markedParts', () => {
  it('splits a snippet into plain and matched parts', () => {
    expect(
      markedParts('…a \u0002rogue\u0003like with \u0002rogue\u0003 cats')
    ).toEqual([
      { text: '…a ', matched: false },
      { text: 'rogue', matched: true },
      { text: 'like with ', matched: false },
      { text: 'rogue', matched: true },
      { text: ' cats', matched: false },
    ]);
  });

  it('keeps matches at the edges, without empty parts', () => {
    expect(markedParts('\u0002Lyon\u0003')).toEqual([
      { text: 'Lyon', matched: true },
    ]);
  });

  it('leaves text without matches whole', () => {
    expect(markedParts('no match')).toEqual([
      { text: 'no match', matched: false },
    ]);
  });
});
