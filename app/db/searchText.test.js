import { describe, expect, it } from 'vitest';

import { normalizeSearch, searchText } from './searchText';

describe('searchText', () => {
  it('joins fields, lowercases, strips accents and collapses spaces', () => {
    expect(searchText('Jéu  Vidéo', null, 'Ça\nmarche', undefined)).toBe(
      'jeu video ca marche'
    );
  });

  it('makes typed queries match regardless of case and accents', () => {
    expect(searchText('Pâtisserie Érable')).toContain(
      normalizeSearch('patisserie ERABLE')
    );
    expect(normalizeSearch(undefined)).toBe('');
  });
});
