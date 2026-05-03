
import { useLoaderData } from 'react-router';
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
  return data;
};

export const meta = () => [{
  title: 'Places 2'
}, {
  name: 'description',
  content: 'Video game related companies and organizations all over the world.'
}, {
  property: 'og:title',
  content: 'Places'
}, {
  property: 'og:description',
  content: 'Video game related companies and organizations all over the world.'
}, {
  name: 'twitter:card',
  content: 'summary_large_image'
}, {
  name: 'twitter:site',
  content: '@IndieColle'
}, {
  name: 'twitter:title',
  content: 'Places'
}, {
  name: 'twitter:description',
  content: 'Video game related companies and organizations all over the world.'
}];

const Places = () => {
  const data = useLoaderData();
  return <pre>{JSON.stringify(data, false, 2)}</pre>;
};

export default Places;
