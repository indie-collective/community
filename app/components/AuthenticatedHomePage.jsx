import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
} from '@chakra-ui/react';
import { useColorModeValue } from '../components/ui/color-mode';
import { Link, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';

import GameCard from './GameCard';
import OrgCard from './OrgCard';
import EventCard from './EventCard';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';

const AuthenticatedHomePage = () => {
  // const toast = useToast();
  const bg = useColorModeValue('white', 'gray.900');

  const { games, studios, associations, eventsToCome, currentUser } =
    useLoaderData();
  const { firstName, eventsToCome: joinedEventsToCome } = currentUser;

  // useEffect(() => {
  //   toast({
  //     title: firstName ? `Welcome back ${firstName}!` : 'Welcome back!',
  //     description: 'Many new games and events await you…',
  //     status: 'success',
  //     duration: 5000,
  //     isClosable: true,
  //     position: 'bottom-right',
  //   });
  // }, []);

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
                <EventCard {...event} />
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      <Box mb={5} px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
        <Heading as="h3" size="xl" mb={5}>
          <Link to="/games">Features games</Link>
        </Heading>

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
      </Box>

      <Grid gap={5} templateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']}>
        <Box mb={5} px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
          <Heading as="h3" size="xl" mb={5}>
            <Link to="/studios">Studios</Link>
          </Heading>

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
        </Box>

        <Box mb={5} px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
          <Heading as="h3" size="xl" mb={5}>
            <Link to="/associations">Associations</Link>
          </Heading>

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
        </Box>
      </Grid>

      <Box px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
        <Heading as="h3" size="xl" mb={5}>
          <Link to="/events">Events</Link>
        </Heading>

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
      </Box>
    </Box>
  );
};

export default AuthenticatedHomePage;
