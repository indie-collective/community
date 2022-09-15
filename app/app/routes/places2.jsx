import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';

import countryCodes from '../assets/countries.json';

import { db } from '../utils/db.server';

export const loader = async ({ request }) => {
  const locations = await db.location.findMany({
    include: {
      _count: {
        select: {
          entity: true,
          event: true,
        },
      },
    },
  });

  const countries = locations.reduce((acc, location) => {
    const code = location.country_code;
    if (!acc[code]) {
      acc[code] = {
        country: countryCodes[location.country_code],
        country_code: location.country_code,
        entities: 0,
        events: 0,
      };
    }

    acc[code].entities += location._count.entity;
    acc[code].events += location._count.event;

    return acc;
  }, {});

  const cities = locations.reduce((acc, location) => {
    const code = [location.country_code, location.city].join(', ');
    if (!acc[code]) {
      acc[code] = {
        city: location.city,
        country: countryCodes[location.country_code],
        country_code: location.country_code,
        region: location.region,
        entities: 0,
        events: 0,
      };
    }

    acc[code].entities += location._count.entity;
    acc[code].events += location._count.event;

    return acc;
  }, {});

  const data = {
    countries: Object.values(countries),
    cities: Object.values(cities),
  };
  return json(data);
};

export const meta = () => ({
  title: 'Places 2',
  description:
    'Video game related companies and organizations all over the world.',
  'og:title': 'Places',
  'og:description':
    'Video game related companies and organizations all over the world.',
  'twitter:card': 'summary_large_image',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Places',
  'twitter:description':
    'Video game related companies and organizations all over the world.',
});

const Places = () => {
  const data = useLoaderData();
  return <pre>{JSON.stringify(data, false, 2)}</pre>;
};

export default Places;
