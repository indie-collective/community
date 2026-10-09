import { Button, Box, Heading, Text, Grid, Image, Presence } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { Link, useLoaderData } from 'react-router';

import React, { useCallback, useState } from 'react';

import { listEvents } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server'
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel.client';
import ClientCarousel from '../components/ClientCarousel';
import Filters from '../components/Filters';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';

const getPage = (searchParams) => Number(searchParams.get('page') || '1');
const getCursor = (searchParams) => searchParams.get('cursor') || undefined;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = getPage(searchParams);
  const cursor = getCursor(searchParams);
  const country = searchParams.get('country');
  const period = searchParams.get('period') || 'upcoming';

  const currentUser = await isAuthenticated(request);

  const { events, pastEvents, countries, years } = await listEvents({
    country,
    period,
  });

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
  return data;
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Events',
    description: 'Indie game events around you and around the world: festivals, conventions, meetups and game jams.',
    path: location.pathname,
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
            <ClientCarousel>
              {() => (
                <Carousel
                  slidesToShow={[1, 2, 3]}
                  onLoadMore={onLoadMore}
                  loadingMore={loadingMore}
                >
                  {events.length > 0 ? (
                    events.map((event) => (
                      <Box key={event.id} minW={0} pr={3}>
                        <Presence
                          present
                          animationName={{
                            _open: 'fade-in',
                            _closed: 'fade-out'
                          }}
                          animationDuration='moderate'>
                          <EventCard {...event} />
                        </Presence>
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
              )}
            </ClientCarousel>
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
