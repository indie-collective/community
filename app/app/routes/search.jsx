import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import { getFullTextSearchQuery } from '../utils/search.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';

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

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const search = getFullTextSearchQuery(q);

  const data = {
    search: q,
    games: await db.game.findMany({
      where: {
        name: {
          search,
        },
      },
    }),
    orgs: await db.entity.findMany({
      where: {
        name: {
          search,
        },
      },
    }),
    events: await db.event.findMany({
      where: {
        name: {
          search,
        },
      },
      include: {
        event_participant: true,
        game_event: true,
      }
    }),
  };

  return json(data);
};

export const meta = ({ data }) => ({
  title: `Results for "${data.search}" | Search`,
});

const SearchPage = () => {
  const helpTextColor = useColorModeValue('gray.300', 'gray.600');
  const { search, games, orgs, events } = useLoaderData();

  const hasNoResults =
    games.length === 0 && orgs.length === 0 && events.length === 0;

  return (
    <Box p={5} mb={5}>
      {search ? (
        <>
          <Heading as="h2" size="2xl" mb={5}>
            Search results for "{search}"
          </Heading>

          {hasNoResults ? (
            <Text>No results found.</Text>
          ) : (
            <>
              {games.length > 0 && (
                <Box mb={10}>
                  <Heading as="h3" size="xl" mb={5}>
                    Games
                  </Heading>

                  <Carousel slidesToShow={[1, 2, 3]}>
                    {games.map((game) => (
                      <Box key={game.id} minW={0} pr={3}>
                        <motion.div variants={variants}>
                          <GameCard {...game} />
                        </motion.div>
                      </Box>
                    ))}
                  </Carousel>
                </Box>
              )}

              {orgs.length > 0 && (
                <Box mb={10}>
                  <Heading as="h3" size="xl" mb={5}>
                    Organizations
                  </Heading>

                  <Carousel slidesToShow={[1, 2, 3]}>
                    {orgs.map((org) => (
                      <Box key={org.id} minW={0} pr={3}>
                        <motion.div variants={variants}>
                          <OrgCard {...org} />
                        </motion.div>
                      </Box>
                    ))}
                  </Carousel>
                </Box>
              )}

              {events.length > 0 && (
                <Box mb={10}>
                  <Heading as="h3" size="xl" mb={5}>
                    Events
                  </Heading>

                  <Carousel slidesToShow={[1, 2, 3]}>
                    {events.map((event) => (
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
            Games, organizations and events matching your research will show up
            here once you start typing.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;
