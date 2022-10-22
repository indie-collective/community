import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Fade,
  useToast,
  Stack,
} from '@chakra-ui/react';
import { useLoaderData } from '@remix-run/react';

import GameCard from './GameCard';
import OrgCard from './OrgCard';
import EventCard from './EventCard';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { useEffect } from 'react';

const AuthenticatedHomePage = () => {
  const toast = useToast();

  const { games, studios, associations, eventsToCome, currentUser } =
    useLoaderData();
  const { firstName, eventsToCome: joinedEventsToCome } = currentUser;

  useEffect(() => {
    toast({
      title: `Welcome back ${firstName}!`,
      description: 'Many new games and events await you…',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  }, []);

  return (
    <Box p={5} mb={5}>
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

      <Box
        mb={5}
        px={4}
        py={5}
        background="white"
        shadow="sm"
        borderRadius={7}
      >
        <Heading as="h3" size="xl" mb={5}>
          Games
        </Heading>

        <Fade in>
          <Grid
            gap={3}
            templateColumns={[
              '2fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
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

      <Grid gap={5} templateColumns={['1fr', 'repeat(2, 1fr)']}>
        <Box
          mb={5}
          px={4}
          py={5}
          background="white"
          shadow="sm"
          borderRadius={7}
        >
          <Heading as="h3" size="xl" mb={5}>
            Studios
          </Heading>

          <Fade in>
            <Grid
              mb={5}
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
              ]}
            >
              {studios.map((studios) => (
                <Box key={studios.id} minW={0}>
                  <OrgCard key={studios.id} {...studios} />
                </Box>
              ))}
            </Grid>
          </Fade>
        </Box>

        <Box
          mb={5}
          px={4}
          py={5}
          background="white"
          shadow="sm"
          borderRadius={7}
        >
          <Heading as="h3" size="xl" mb={5}>
            Associations
          </Heading>

          <Fade in>
            <Grid
              mb={5}
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
              ]}
            >
              {associations.map((associations) => (
                <Box key={associations.id} minW={0}>
                  <OrgCard key={associations.id} {...associations} />
                </Box>
              ))}
            </Grid>
          </Fade>
        </Box>
      </Grid>

      <Box px={4} py={5} background="white" shadow="sm" borderRadius={7}>
        <Heading as="h3" size="xl" mb={5}>
          Events
        </Heading>

        <Fade in>
          {eventsToCome.length > 0 ? (
            <Grid
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(3, 1fr)',
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
