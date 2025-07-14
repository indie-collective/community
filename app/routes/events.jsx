import {
  Button,
  Box,
  Heading,
  Text,
  Grid,
  Image,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import React, { useCallback, useState } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import getImageLinks from '../utils/imageLinks.server';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const getPage = (searchParams) => Number(searchParams.get('page') || '1');
const getCursor = (searchParams) => searchParams.get('cursor') || undefined;

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const page = getPage(searchParams);
  const cursor = getCursor(searchParams);

  const currentUser = await authenticator.isAuthenticated(request);

  const data = {
    events: await db.event
      .findMany({
        where: {
          ends_at: {
            gte: new Date(),
          },
        },
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
          starts_at: 'asc',
        },
        cursor,
        take: 6,
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          cover: event.cover ? getImageLinks(event.cover) : null,
        }))
      ),
    pastEvents: await db.event
      .findMany({
        where: {
          ends_at: {
            lt: new Date(),
          },
        },
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
          starts_at: 'desc',
        },
        skip: (page - 1) * 10,
        take: 10,
      })
      .then((events) =>
        events.map((event) => ({
          ...event,
          cover: event.cover ? getImageLinks(event.cover) : null,
        }))
      ),
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
    <Box p={5}>
      <Carousel
        slidesToShow={[1, 2, 3]}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
      >
        {events.length > 0 ? (
          events.map((event) => (
            <Box key={event.id} minW={0} pr={3}>
              <EventCard {...event} />
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
            leftIcon={<FiPlus />}
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
  );
};

export default Events;
