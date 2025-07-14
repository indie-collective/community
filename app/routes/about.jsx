import {
  Box,
  Heading,
  Text,
  StatGroup,
  StatLabel,
  Stat,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';

export const loader = async () => {
  const data = {
    gamesCount: await db.game.count({
      where: {
        deleted: false,
      },
    }),
    entitiesCount: await db.entity.count(),
    eventsCount: await db.event.count(),
  };

  return json(data);
};

export const meta = () => ({
  title: 'About',
  description: 'Video game related events around you and all over the world.',
  'og:title': 'About',
  'og:description':
    'Video game related events around you and all over the world.',
  'twitter:card': 'summary',
  'twitter:site': '@IndieColle',
  'twitter:title': 'About',
  'twitter:description':
    'Video game related events around you and all over the world.',
});

const AboutPage = () => {
  const { gamesCount, entitiesCount, eventsCount } = useLoaderData();

  return (
    <Box p={5} mb={5}>
      <Box py={5} mb={10} textAlign="center">
        <Box m="auto" width={['auto', 'auto', '75%', '50%']}>
          <Heading mb={5} size="2xl">
            Find Your Community
          </Heading>

          <Text mb={5}>
            Community lets you explore indie game-focused data around the world.
            <br />
            Discover who, where and what has been / is being made near you
            through crowd-sourced data.
          </Text>

          <StatGroup my={2}>
            <Stat>
              <StatNumber>{gamesCount}</StatNumber>
              <StatLabel>games</StatLabel>
            </Stat>

            <Stat>
              <StatNumber>{entitiesCount}</StatNumber>
              <StatLabel>orgs</StatLabel>
            </Stat>

            <Stat>
              <StatNumber>{eventsCount}</StatNumber>
              <StatLabel>events</StatLabel>
            </Stat>
          </StatGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default AboutPage;
