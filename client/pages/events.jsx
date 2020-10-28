import { gql, useQuery } from '@apollo/client';
import {
  Button,
  Box,
  Spinner,
  Heading,
  Text,
  Grid,
  Image,
} from '@chakra-ui/core';
import { motion } from 'framer-motion';
import Head from 'next/head';
import React, { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';

import { withApollo } from '../lib/apollo';
import useCurrentPerson from '../hooks/useCurrentPerson';
import Navigation from '../components/Navigation';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const getPastEvents = gql`
  ${EventCard.fragments.event}

  query getPastEvents($now: Datetime!) {
    pastEvents: events(
      filter: { endsAt: { lessThan: $now } }
      first: 20
      orderBy: STARTS_AT_DESC
    ) {
      nodes {
        id
        ...EventCardEvent
      }
    }
  }
`;

const getEvents = gql`
  ${EventCard.fragments.event}

  query getEvents($now: Datetime!, $cursor: Cursor) {
    events(
      filter: { endsAt: { greaterThanOrEqualTo: $now } }
      first: 6
      after: $cursor
      orderBy: STARTS_AT_ASC
    ) {
      nodes {
        id
        ...EventCardEvent
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

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

const Events = () => {
  const now = useMemo(() => new Date(), []);
  const currentPerson = useCurrentPerson();
  const [loadingMore, setLoadingMore] = useState(false);
  const { data: dataPasts, loading: loadingPasts } = useQuery(getPastEvents, {
    variables: { now },
  });
  const { data, fetchMore, loading } = useQuery(getEvents, {
    variables: { now },
  });

  const onLoadMore = useCallback(async () => {
    if (loading || !data.events.pageInfo.hasNextPage) return;

    setLoadingMore(true);

    await fetchMore({
      variables: {
        cursor: data.events.pageInfo.endCursor,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const { nodes, pageInfo } = fetchMoreResult.events;

        return nodes.length
          ? {
              events: {
                __typename: previousResult.events.__typename,
                nodes: [...previousResult.events.nodes, ...nodes],
                pageInfo,
              },
            }
          : previousResult;
      },
    });

    setLoadingMore(false);
  }, [loading, data]);

  return (
    <div>
      <Head>
        <title>Events</title>
        <meta
          name="description"
          content="Video game related events around you and all over the world."
        />
        <meta property="og:title" content="Events" />
        <meta
          property="og:description"
          content="Video game related events around you and all over the world."
        />

        <meta name="twitter:card" content={'summary'} />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content="Events" />
        <meta
          name="twitter:description"
          content="Video game related events around you and all over the world."
        />
      </Head>

      <Navigation />

      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Spinner size="lg" />
        </Box>
      ) : (
        <Box p={5}>
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Carousel
              slidesToShow={[1, 2, 3]}
              onLoadMore={onLoadMore}
              loadingMore={loadingMore}
            >
              {data.events.nodes.length > 0 ? (
                data.events.nodes.map((event) => (
                  <Box key={event.id} minW={0} pr={3}>
                    <motion.div variants={eventVariants}>
                      <EventCard {...event} />
                    </motion.div>
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
          </motion.div>

          {currentPerson && (
            <Link href="/events/create">
              <Button
                display="block"
                m="auto"
                mt={10}
                size="lg"
                variantColor="teal"
                leftIcon="add"
              >
                Add an event
              </Button>
            </Link>
          )}

          <Heading mb={4} mt={5}>
            Past events
          </Heading>
          {loadingPasts ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Spinner size="lg" />
            </Box>
          ) : (
            <motion.div
              initial="initial"
              animate="enter"
              exit="exit"
              variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
            >
              <Grid
                gap={3}
                templateColumns={[
                  'repeat(2, 1fr)',
                  'repeat(2, 1fr)',
                  'repeat(3, 1fr)',
                  'repeat(4, 1fr)',
                ]}
              >
                {dataPasts.pastEvents.nodes.map((event) => (
                  <Box minW={0} key={event.id}>
                    <motion.div variants={eventVariants}>
                      <EventCard {...event} />
                    </motion.div>
                  </Box>
                ))}
              </Grid>
            </motion.div>
          )}
        </Box>
      )}
    </div>
  );
};

export default withApollo()(Events);
