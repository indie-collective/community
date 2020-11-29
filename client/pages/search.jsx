import { gql, useQuery } from '@apollo/client';
import { Box, Spinner, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import Head from 'next/head';
import { motion } from 'framer-motion';

import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';
import { withApollo } from '../lib/apollo';
import { useRouter } from 'next/dist/client/router';
import useDebounce from '../hooks/useDebounce';

const searchQuery = gql`
  ${GameCard.fragments.game}
  ${OrgCard.fragments.org}
  ${EventCard.fragments.event}

  query search(
    $gameTokens: [GameFilter!]!
    $orgTokens: [EntityFilter!]!
    $eventTokens: [EventFilter!]!
  ) {
    games(filter: { or: $gameTokens }, first: 10) {
      nodes {
        id
        ...GameCardGame
      }
    }

    orgs: entities(filter: { or: $orgTokens }, first: 10) {
      nodes {
        id
        ...OrgCardOrg
      }
    }

    events(filter: { or: $eventTokens }, first: 10) {
      nodes {
        id
        startsAt
        ...EventCardEvent
      }
    }
  }
`;

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

const SearchPage = () => {
  const router = useRouter();

  const helpTextColor = useColorModeValue('gray.300', 'gray.600');

  const search = router.query.q;
  const debouncedSearch = useDebounce(router.query.q, 300);

  const tokens = debouncedSearch
    ? debouncedSearch.split(' ').map((token) => ({
        name: {
          likeInsensitive: `%${token}%`,
        },
      }))
    : [];
  const { data, loading } = useQuery(searchQuery, {
    variables: {
      gameTokens: tokens,
      orgTokens: tokens,
      eventTokens: tokens,
    },
  });

  const hasNoResults =
    loading ||
    !data ||
    (data.games.nodes.length === 0 &&
      data.orgs.nodes.length === 0 &&
      data.events.nodes.length === 0);

  return (
    <Box>
      <Navigation search={search} />

      <Box p={5} mb={5}>
        <Head>
          <title>
            {search && `Results for "${search}" | `}
            Search
          </title>
        </Head>

        {search ? (
          <>
            <Heading as="h2" size="2xl" mb={5}>
              Search results for "{search}"
            </Heading>

            {loading && <Spinner />}
            {!loading && hasNoResults && <Text>No results found.</Text>}
            {!loading && !hasNoResults && (
              <>
                {data.games.nodes.length > 0 && (
                  <Box mb={10}>
                    <Heading as="h3" size="xl" mb={5}>
                      Games
                    </Heading>

                    <Carousel slidesToShow={[1, 2, 3]}>
                      {data.games.nodes.map((game) => (
                        <Box key={game.id} minW={0} pr={3}>
                          <motion.div variants={variants}>
                            <GameCard {...game} />
                          </motion.div>
                        </Box>
                      ))}
                    </Carousel>
                  </Box>
                )}

                {data.orgs.nodes.length > 0 && (
                  <Box mb={10}>
                    <Heading as="h3" size="xl" mb={5}>
                      Organizations
                    </Heading>

                    <Carousel slidesToShow={[1, 2, 3]}>
                      {data.orgs.nodes.map((org) => (
                        <Box key={org.id} minW={0} pr={3}>
                          <motion.div variants={variants}>
                            <OrgCard {...org} />
                          </motion.div>
                        </Box>
                      ))}
                    </Carousel>
                  </Box>
                )}

                {data.events.nodes.length > 0 && (
                  <Box mb={10}>
                    <Heading as="h3" size="xl" mb={5}>
                      Events
                    </Heading>

                    <Carousel slidesToShow={[1, 2, 3]}>
                      {data.events.nodes.map((event) => (
                        <Box key={event.id} minW={0} pr={3}>
                          <motion.div variants={variants}>
                            <EventCard {...event} />
                          </motion.div>
                        </Box>
                      ))}
                    </Carousel>
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <Box textAlign="center" p={20}>
            <Text color={helpTextColor} fontSize="3xl">
              Games, organizations and events matching your research will show
              up here once you start typing.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default withApollo({ ssr: true })(SearchPage);
