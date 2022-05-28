import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Fade,
} from '@chakra-ui/react';
import { useLoaderData } from '@remix-run/react';

import GameCard  from './GameCard';
import OrgCard from './OrgCard';
import EventCard  from './EventCard';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const AuthenticatedHomePage = () => {
  const { games, entities, eventsToCome, currentUser } = useLoaderData();
  const { firstName, eventsToCome: joinedEventsToCome } = currentUser;

  return (
    <Box p={5} mb={5}>
      <Heading size="2xl" mb={10}>
        Welcome back {firstName}!
      </Heading>

      {joinedEventsToCome.length > 0 && (
        <Box mb={10}>
          <Heading as="h3" size="xl" mb={5}>
            Your upcoming events
          </Heading>

          <Grid
            gap={3}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
            ]}
          >
            {joinedEventsToCome.map((event) => (
              <Box key={event.id} minW={0}>
                <Fade in>
                  <EventCard {...event} />
                </Fade>
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      <Box mb={10}>
        <Heading as="h3" size="xl" mb={5}>
          Recently added games
        </Heading>

        <Fade in>
          <Grid
            gap={3}
            templateColumns={[
              '2fr',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
              'repeat(6, 1fr)',
            ]}
          >
            {games.map((game) => (
              <Box key={game.id} minW={0}>
                <GameCard {...game} />
              </Box>
            ))}
          </Grid>
        </Fade>
      </Box>

      <Box mb={10}>
        <Heading as="h3" size="xl" mb={5}>
          Recently added orgs
        </Heading>

        <Fade in>
          <Grid
            mb={5}
            gap={3}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
            ]}
          >
            {entities.map((org) => (
              <Box key={org.id} minW={0}>
                <OrgCard key={org.id} {...org} />
              </Box>
            ))}
          </Grid>
        </Fade>
      </Box>

      <Box>
        <Heading as="h3" size="xl" mb={5}>
          Upcoming events
        </Heading>

        <Fade in>
          {eventsToCome.length > 0 ? (
            <Grid
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
              ]}
            >
              {eventsToCome.map((event) => (
                <Box key={event.id} minW={0}>
                  <EventCard {...event} />
                </Box>
              ))}
            </Grid>
          ) : (
            <Box mt={5} width={['auto', '50%', '35%', '25%']} mx="auto">
              <Image src={noEventsImage} alt="" />
              <Text fontSize="xl" mt={5} textAlign="center">
                No upcoming events yet, sadly.
              </Text>
            </Box>
          )}
        </Fade>
      </Box>
    </Box>
  );
};

export default AuthenticatedHomePage;
