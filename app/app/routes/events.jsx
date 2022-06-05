import { Button, Box, Heading, Text, Grid, Image } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';

import { db } from '../utils/db.server';
import Navigation from '../components/Navigation';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const eventVariants = {
  initial: { scale: 0.96, y: 30, opacity: 0 },
  enter: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] },
  },
};

const getPage = (searchParams) => Number(searchParams.get('page') || '1');
const getCursor = (searchParams) => searchParams.get('cursor') || undefined;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = getPage(searchParams);
  const cursor = getCursor(searchParams);

  const data = {
    events: await db.event.findMany({
      where: {
        ends_at: {
          gte: new Date(),
        },
      },
      include: {
        event_participant: true,
        game_event: true,
        location: true,
      },
      orderBy: {
        starts_at: 'desc',
      },
      cursor,
      take: 6,
    }),
    pastEvents: await db.event.findMany({
      where: {
        ends_at: {
          lt: new Date(),
        },
      },
      include: {
        event_participant: true,
        game_event: true,
        location: true,
      },
      orderBy: {
        starts_at: 'desc',
      },
      skip: (page - 1) * 10,
      take: 10,
    }),
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
    },
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
  'twitter:title': 'Events',
  'twitter:description':
    'Video game related events around you and all over the world.',
});

const Events = () => {
  const { events, pastEvents, currentUser } = useLoaderData();
  const [loadingMore, setLoadingMore] = useState(false);

  const onLoadMore = useCallback(async () => {
    setLoadingMore(true);
    console.log('load more');

    setLoadingMore(false);
  });

  return (
    <div>
      <Navigation />

      <Box p={5}>
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
                No upcoming events yet, sadly.
              </Text>
            </Box>
          )}
        </Carousel>

        {currentUser && (
          <Link to="/events/create">
            <Button
              display="block"
              m="auto"
              mt={10}
              size="lg"
              colorScheme="teal"
              leftIcon={<AddIcon />}
            >
              Add an event
            </Button>
          </Link>
        )}

        <Heading mb={4} mt={5}>
          Past events
        </Heading>
        <Grid
          gap={3}
          templateColumns={[
            'repeat(2, 1fr)',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
          ]}
        >
          {pastEvents.map((event) => (
            <Box minW={0} key={event.id}>
              <EventCard {...event} />
            </Box>
          ))}
        </Grid>
      </Box>
    </div>
  );
};

export default Events;
