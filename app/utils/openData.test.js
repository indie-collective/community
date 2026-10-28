import { describe, expect, it } from 'vitest';

import { FILES, csv, readme } from './openData';

describe('csv', () => {
  it('quotes what needs it and writes dates as ISO', () => {
    expect(
      csv([{ id: 1, name: 'Héros, "the game"', about: 'line\nbreak', at: new Date('2026-01-02T03:04:05Z') }], [['id'], ['name'], ['about'], ['at'], ['none']])
    ).toBe('id,name,about,at,none\r\n1,"Héros, ""the game""","line\nbreak",2026-01-02T03:04:05.000Z,\r\n');
  });
});

it('documents every file and field in the README, with the licence', () => {
  const text = readme('2026-10-26');
  expect(text).toContain('Open Database License (ODbL) 1.0');
  for (const [file, , columns] of FILES) {
    expect(text).toContain(`${file}: `);
    for (const [name] of columns) expect(text).toContain(`  ${name}: `);
  }
  expect(text).toContain('Not included: members, their emails and accounts');
});
