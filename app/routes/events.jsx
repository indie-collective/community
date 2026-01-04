import {
  Button,
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Fade,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import React, { useCallback, useState } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import getImageLinks from '../utils/imageLinks.server';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';
import Filters from '../components/Filters';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const getPage = (searchParams) => Number(searchParams.get('page') || '1');
const getCursor = (searchParams) => searchParams.get('cursor') || undefined;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = getPage(searchParams);
  const cursor = getCursor(searchParams);
  const country = searchParams.get('country');
  const period = searchParams.get('period') || 'upcoming';

  const currentUser = await authenticator.isAuthenticated(request);

  const where = {};

  if (country) {
    where.location = {
      country_code: country,
    };
  }

  if (period === 'upcoming') {
    where.ends_at = {
      gte: new Date(),
    };
  } else {
    const year = parseInt(period, 10);
    if (!isNaN(year)) {
      where.starts_at = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }
  }

  const events = await db.event
    .findMany({
      where,
      include: {
        event_participant: true,
        game_event: {
          where: {
            game: {
              deleted: false,
            },
          },
        },
        location: true,
        cover: true,
      },
      orderBy: {
        starts_at: period === 'upcoming' ? 'asc' : 'desc',
      },
      // cursor, // Disabled cursor for now as it complicates filtered pagination
      // take: 6, // Removed take limit for filter view consistency for now
    })
    .then((events) =>
      events.map((event) => ({
        ...event,
        cover: event.cover ? getImageLinks(event.cover) : null,
      }))
    );

  // We only fetch past events for the default view or if we want to show everything
  // But with filters, we usually show a single results list.
  // The original UI showed "Upcoming" (Carousel) + "Past" (Grid).
  // If we filter, we probably just show the results.
  // If period is 'upcoming', it matches the original 'events' query (mostly).

  // Let's re-use 'events' for the main visual.

  // Original 'pastEvents' logic:
  let pastEvents = [];
  if (period === 'upcoming') {
    pastEvents = await db.event.findMany({
      where: {
        ends_at: {
          lt: new Date(),
        },
        ...(country ? { location: { country_code: country } } : {}),
      },
      include: {
        location: true,
        cover: true,
      },
      orderBy: {
        starts_at: 'desc',
      },
      take: 10,
    }).then((events) =>
      events.map((event) => ({
        ...event,
        cover: event.cover ? getImageLinks(event.cover) : null,
      }))
    );
  }

  const countries = await db.location.groupBy({
    by: ['country_code'],
    where: {
      event: {
        some: {},
      },
    },
    _count: true,
    orderBy: {
      _count: {
        country_code: 'desc',
      },
    },
  });

  // Get distinct years
  const years = await db.$queryRaw`
    SELECT DISTINCT EXTRACT(YEAR FROM starts_at) as year
    FROM event
    ORDER BY year DESC
  `;

  const data = {
    events,
    pastEvents, // Only populated if period is upcoming
    facets: {
      countries,
      years,
    },
    selected: {
      country,
      period
    },
    currentUser,
  };
  return json(data);
};

export const meta = () => ({
  title: 'Events',
  description: 'Video game related events around you and all over the world.',
  'og:title': 'Events',
  'og:description':
    'Video game related events around you and all over the world.',
  'twitter:card': 'summary',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Events',
  'twitter:description':
    'Video game related events around you and all over the world.',
});

const Events = () => {
  const { events, pastEvents, currentUser, facets, selected } = useLoaderData();
  const [loadingMore, setLoadingMore] = useState(false);

  const onLoadMore = useCallback(async () => {
    setLoadingMore(true);
    console.log('load more');

    setLoadingMore(false);
  });

  const isPeriodUpcoming = selected.period === 'upcoming';
  const showCarousel = isPeriodUpcoming && !selected.country;

  return (
    <Box p={5}>
      <Filters facets={facets} selected={selected} type="event" />

      {isPeriodUpcoming ? (
        <>
          {showCarousel ? (
            <Carousel
              slidesToShow={[1, 2, 3]}
              onLoadMore={onLoadMore}
              loadingMore={loadingMore}
            >
              {events.length > 0 ? (
                events.map((event) => (
                  <Box key={event.id} minW={0} pr={3}>
                    <Fade in>
                      <EventCard {...event} />
                    </Fade>
                  </Box>
                ))
              ) : (
                <Box mt={10}>
                  <Image src={noEventsImage} alt="" />
                  <Text fontSize="xl" mt={10} textAlign="center">
                    No upcoming events found.
                  </Text>
                </Box>
              )}
            </Carousel>
          ) : (
            <Grid
              gap={3}
              mb={10}
              templateColumns={[
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(3, 1fr)',
              ]}
            >
              {events.length > 0 ? events.map((event) => (
                <Box minW={0} key={event.id}>
                  <EventCard {...event} />
                </Box>
              )) : (
                <Text fontSize="xl" mt={10} textAlign="center">
                  No upcoming events found in {selected.country}.
                </Text>
              )}
            </Grid>
          )}

          {pastEvents.length > 0 && (
            <>
              <Heading mb={4} mt={5}>
                Past events
              </Heading>
              <Grid
                gap={3}
                templateColumns={[
                  'repeat(2, 1fr)',
                  'repeat(2, 1fr)',
                  'repeat(3, 1fr)',
                  'repeat(3, 1fr)',
                ]}
              >
                {pastEvents.map((event) => (
                  <Box minW={0} key={event.id}>
                    <EventCard {...event} />
                  </Box>
                ))}
              </Grid>
            </>
          )}
        </>
      ) : (
        <Grid
          gap={3}
          templateColumns={[
            'repeat(2, 1fr)',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(3, 1fr)',
          ]}
        >
          {events.length > 0 ? events.map((event) => (
            <Box minW={0} key={event.id}>
              <EventCard {...event} />
            </Box>
          )) : (
            <Text fontSize="xl" mt={10} textAlign="center">
              No events found for {selected.period}.
            </Text>
          )}
        </Grid>
      )}

    </Box>
  );
};

export default Events;
