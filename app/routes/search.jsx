import { Box, Heading, Text } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import { getFullTextSearchQuery } from '../utils/search.server';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';



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
        game_event: {
          where: {
            game: {
              deleted: false,
            },
          },
        },
      },
    }),
  };

  return json(data);
};

export const meta = ({ data }) => ({
  title: `Results for "${data.search}" | Search`,
});

const SearchPage = () => {
  const helpTextColor = 'gray.300';
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
                        <GameCard {...game} />
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
                        <OrgCard {...org} />
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
                        <EventCard {...event} />
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
