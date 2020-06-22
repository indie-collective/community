import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {
  Box,
  Text,
  Heading,
  Spinner,
  Badge,
  DarkMode,
  Grid,
} from '@chakra-ui/core';
import Error from 'next/error';
import Head from 'next/head';
import { motion } from 'framer-motion';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import EventCard from '../../components/EventCard';

const TYPES_ABBR = {
  STUDIO: 'studio',
  ASSOCIATION: 'asso.',
  ORGANIZATION: 'org.',
};

const TYPES_COLORS = {
  STUDIO: 'yellow',
  ASSOCIATION: 'green',
  ORGANIZATION: 'purple',
};

const orgQuery = gql`
  ${GameCard.fragments.game}
  ${EventCard.fragments.event}

  query org($id: UUID!) {
    entity(id: $id) {
      id
      name
      type
      about

      images {
        nodes {
          id
          thumbnail_url
        }
      }

      people {
        totalCount
      }

      games {
        totalCount
        nodes {
          id
          ...GameCardGame
        }
      }

      events {
        totalCount
        nodes {
          id
          ...EventCardEvent
        }
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const variants = {
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

const Org = ({ id, host }) => {
  const validId = uuidRegex.test(id);

  const { loading, error, data } = useQuery(orgQuery, {
    variables: { id },
    skip: !validId,
  });

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const { name, type, about, images, games, events } = data.entity;

  return (
    <div>
      <Head>
        <title>{name} - Organizations</title>

        <meta property="og:title" content={name} />
        <meta property="og:description" content={`${about}.`} />
        <meta property="og:url" content={`https://${host}/event/${id}`} />
        {images[0] && (
          <meta property="og:image" content={images[0].thumbnail_url} />
        )}

        <meta
          name="twitter:card"
          content={images[0] ? 'summary_large_image' : 'summary'}
        />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content={name} />
        <meta name="twitter:description" content={`${about}.`} />
        {images[0] && (
          <meta name="twitter:image" content={images[0].thumbnail_url} />
        )}
      </Head>

      <Navigation />

      <Box mb={5} pl={5} pr={5}>
        <Heading>{name}</Heading>
        <DarkMode>
          <Badge rounded={3} variant="solid" variantColor={TYPES_COLORS[type]}>
            {TYPES_ABBR[type]}
          </Badge>
        </DarkMode>
        <Text fontSize="md" mt={3}>
          {about}
        </Text>
      </Box>

      {games.nodes.length > 0 && (
        <Box pl={5} pr={5}>
          <Heading size="md" mb={2}>
            Games
            <Badge
              verticalAlign="baseline"
              fontSize="md"
              ml={2}
              variant="subtle"
              variantColor="teal"
            >
              {games.nodes.length}
            </Badge>
          </Heading>

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
              {games.nodes.map((game) => (
                <Box minW={0} key={game.id}>
                  <motion.div variants={variants}>
                    <GameCard {...game} />
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}

      {events.nodes.length > 0 && (
        <Box pl={5} pr={5}>
          <Heading size="md" mb={2}>
            Hosted events
            <Badge
              verticalAlign="baseline"
              fontSize="md"
              ml={2}
              variant="subtle"
              variantColor="teal"
            >
              {events.nodes.length}
            </Badge>
          </Heading>

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
              {events.nodes.map((event) => (
                <Box minW={0} key={event.id}>
                  <motion.div variants={variants}>
                    <EventCard {...event} />
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}
    </div>
  );
};

Org.getInitialProps = async (context) => {
  const { id } = context.query;

  if (context.req) {
    return {
      id,
      host: context.req.headers.host,
    };
  }

  return {
    id,
    host: window.location.hostname,
  };
};

export default withApollo({ ssr: true })(Org);
