import {
  Box,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';

import { useLoaderData } from 'react-router';

import { pageMeta } from '../utils/meta';
import { Page, PageHeader, PageSection } from '../components/Page';
import { countEvents } from '../data/events.server';
import { countGames } from '../data/games.server';
import { countOrganizations } from '../data/organizations.server';

export const loader = async () => {
  const [gamesCount, entitiesCount, eventsCount] = await Promise.all([
    countGames(),
    countOrganizations(),
    countEvents(),
  ]);
  return { gamesCount, entitiesCount, eventsCount };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'About',
    description:
      'An open-source, crowd-sourced database of indie games, studios, associations and events from all around the world.',
    path: location.pathname,
  });

// A section of prose: its h2 and paragraphs, at a readable width.
const Prose = ({ title, children }) => (
  <PageSection title={title} maxW="2xl">
    <Stack gap={4}>{children}</Stack>
  </PageSection>
);

const AboutPage = () => {
  const { gamesCount, entitiesCount, eventsCount } = useLoaderData();
  const stats = [
    [gamesCount, 'games'],
    [entitiesCount, 'studios and associations'],
    [eventsCount, 'events'],
  ];

  return (
    <Page>
      <PageHeader
        title="About"
        description="An open-source, crowd-sourced map of the indie game world: who makes games, where, and what's coming up near you."
      />

      <SimpleGrid
        as="ul"
        listStyleType="none"
        columns={{ base: 1, sm: 3 }}
        gap={3}
        mb={{ base: 8, md: 10 }}
        maxW="2xl"
      >
        {stats.map(([value, label]) => (
          <Box
            as="li"
            key={label}
            p={4}
            bg="surface"
            borderRadius="xl"
            shadow="xs"
          >
            <Text
              fontFamily="heading"
              fontWeight="semibold"
              fontSize="3xl"
              lineHeight="1.1"
            >
              {value.toLocaleString('en')}
            </Text>
            <Text color="muted">{label}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Prose title="Why it matters">
        <Text>
          Welcome to community.indieco.xyz, an open-source and crowd-sourced
          platform that brings together indie game data from all around the
          world. Our goal is to make it easier for anyone, whether you're a
          creator, player, researcher or enthusiast, to discover who is making
          games, where they're made, and what's emerging near you.
        </Text>
        <Text>
          By curating and mapping this information, we celebrate the diversity
          of indie game development, showcase hidden gems, and connect people
          with local and global creative communities.
        </Text>
      </Prose>

      <Prose title="Open source and collaborative">
        <Text>
          This project is built in the open, and anyone can contribute: adding
          studios, games and events, or improving features and design. We
          believe in shared ownership and collective knowledge, so the data and
          tools stay accessible and useful to everyone.
        </Text>
      </Prose>

      <Prose title="Origins">
        <Text>
          Community grew out of the work of the Indie Collective, a French
          non-profit that supports indie game creators with visibility,
          resources and connections. This platform builds on that foundation and
          extends it into a global, crowd-sourced initiative.
        </Text>
        <Text>
          To learn more about the Indie Collective and their work,{' '}
          <ChakraLink href="https://indieco.xyz/" textDecoration="underline">
            visit their website
          </ChakraLink>
          .
        </Text>
        <Text fontWeight="semibold">
          Together, let's map the indie game world, and make it easier to
          discover, connect and celebrate creativity.
        </Text>
      </Prose>
    </Page>
  );
};

export default AboutPage;
