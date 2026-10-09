import { describe, expect, it } from 'vitest';

import {
  change,
  event,
  game,
  gameImages,
  imageColumns,
  ms,
  organization,
  person,
} from './fromPostgres';

const at = (iso) => new Date(iso);
const image = (id, name, extra = {}) => ({
  id,
  image_file: name ? { name, width: 960, height: 540, ETag: 'x' } : {},
  ...extra,
});

describe('fromPostgres', () => {
  it('turns times into milliseconds', () => {
    expect(ms(at('2026-01-02T03:04:05.006Z'))).toBe(
      Date.UTC(2026, 0, 2, 3, 4, 5, 6)
    );
    expect(ms(null)).toBeNull();
  });

  it('keeps an image as key and size, and nothing without a file', () => {
    expect(imageColumns('logo', image('i', 'a.jpg'))).toEqual({
      logo_key: 'a.jpg',
      logo_width: 960,
      logo_height: 540,
    });
    expect(imageColumns('logo', image('i', null))).toEqual({
      logo_key: null,
      logo_width: null,
      logo_height: null,
    });
    expect(imageColumns('logo', undefined)).toEqual({
      logo_key: null,
      logo_width: null,
      logo_height: null,
    });
  });

  it('puts an org’s location and logo on the org, with its search text', () => {
    const row = organization(
      {
        id: 'o',
        type: 'studio',
        status: 'hiatus',
        name: 'Ça Studio',
        about: 'Jeux',
        site: null,
        created_at: at('2020-01-01'),
        updated_at: at('2021-01-01'),
      },
      {
        country_code: 'FR',
        region: 'Brittany',
        city: 'Rennes',
        street: null,
        latitude: 48.1,
        longitude: -1.7,
      },
      image('l', 'logo.png')
    );
    expect(row).toMatchObject({
      type: 'studio',
      status: 'hiatus',
      country_code: 'FR',
      city: 'Rennes',
      latitude: 48.1,
      logo_key: 'logo.png',
      search_text: 'ca studio jeux',
      deleted_at: null,
      created_at: Date.UTC(2020, 0, 1),
    });
  });

  it('dates a deleted game’s deletion at its last update', () => {
    const base = {
      id: 'g',
      name: 'G',
      created_at: at('2020-01-01'),
      updated_at: at('2024-02-24'),
    };
    expect(game({ ...base, deleted: true }).deleted_at).toBe(
      Date.UTC(2024, 1, 24)
    );
    expect(game({ ...base, deleted: false }).deleted_at).toBeNull();
  });

  it('keeps an event’s times, zone and status, without a location when it has none', () => {
    const row = event(
      {
        id: 'e',
        name: 'Jam',
        starts_at: at('2026-05-22T01:00:00Z'),
        ends_at: at('2026-05-24T09:00:00Z'),
        time_zone: 'Asia/Tokyo',
        status: 'canceled',
        created_at: at('2026-01-01'),
        updated_at: null,
      },
      null,
      null
    );
    expect(row).toMatchObject({
      starts_at: Date.UTC(2026, 4, 22, 1),
      time_zone: 'Asia/Tokyo',
      status: 'canceled',
      country_code: null,
      cover_key: null,
    });
    expect(row.updated_at).toBe(row.created_at);
  });

  it('makes only the named people admins, everyone else a member', () => {
    const base = {
      id: 'p',
      first_name: 'F',
      avatar_oauth: 'https://cdn/a.png',
    };
    const admins = new Set(['engleek']);
    expect(
      person({ ...base, username: 'engleek', isAdmin: true }, null, admins)
    ).toMatchObject({
      role: 'admin',
      avatar_url: 'https://cdn/a.png',
      did: null,
    });
    // A Discord-role admin who isn't named becomes a member.
    expect(
      person({ ...base, username: 'stvrsky', isAdmin: true }, null, admins).role
    ).toBe('member');
    expect(
      person(
        { ...base, username: 'u', isAdmin: false },
        image('a', 'me.jpg'),
        admins
      )
    ).toMatchObject({
      role: 'member',
      avatar_key: 'me.jpg',
    });
  });

  it('numbers a game’s images in the order they were added, skipping images without a file', () => {
    const images = new Map([
      ['a', image('a', 'a.jpg')],
      ['b', image('b', 'b.jpg')],
      ['c', image('c', null)],
    ]);
    const rows = gameImages(
      [
        { game_id: 'g', image_id: 'b', created_at: at('2021-01-01') },
        { game_id: 'g', image_id: 'a', created_at: at('2020-01-01') },
        { game_id: 'g', image_id: 'c', created_at: at('2019-01-01') },
      ],
      images
    );
    expect(rows.map((r) => [r.id, r.key, r.position])).toEqual([
      ['a', 'a.jpg', 0],
      ['b', 'b.jpg', 1],
    ]);
  });

  it('renames the change log’s tables and keeps its data as recorded', () => {
    expect(
      change({
        id: 'c',
        operation: 'update',
        table_name: 'entity',
        record_id: 'o',
        data: { name: 'X' },
        author_id: null,
        created_at: at('2026-01-01'),
      })
    ).toEqual({
      id: 'c',
      operation: 'update',
      table_name: 'organizations',
      record_id: 'o',
      data: '{"name":"X"}',
      author_id: null,
      created_at: Date.UTC(2026, 0, 1),
    });
  });
});
