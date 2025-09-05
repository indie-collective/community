import {
  Box,
  Heading,
  Text,
  StatGroup,
  StatLabel,
  StatNumber,
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
      <Box py={5} mb={10}>
        <Box>
          <Heading mb={5} size="2xl">
            About this Project
          </Heading>

          <Text mb={5}>
            Welcome to community.indieco.xyz, an open-source and crowd-sourced
            platform designed to bring together indie game-focused data from all
            around the world. Our goal is to make it easier for anyone—whether
            you're a creator, player, researcher, or enthusiast—to discover who
            is making games, where they are being created, and what projects are
            emerging near you.
          </Text>

          <Heading mb={5} size="lg">
            Why This Matters
          </Heading>

          <Text mb={5}>
            By curating and visualizing this information, we aim to celebrate
            the diversity of indie game development, showcase hidden gems, and
            connect people with local and global creative communities. Whether
            you're looking to find other developers nearby, explore new studios,
            or learn more about the indie game scene in a particular region,
            this platform is built to help you.
          </Text>

          <Heading mb={5} size="lg">
            Open Source & Collaborative
          </Heading>

          <Text mb={5}>
            This project is built in the open, and anyone can contribute. From
            adding new studios, games, or creators to improving features and
            design, the community drives this platform forward. We believe in
            shared ownership and collective knowledge, ensuring that the data
            and tools remain accessible and useful to everyone.
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

          <Heading mb={5} size="lg">
            Origins
          </Heading>

          <Text mb={5}>
            Community.indieco.xyz is forked from the work of the Indie
            Collective, a French non-profit dedicated to supporting indie game
            creators and helping them grow. Their mission has always been to
            provide visibility, resources, and connections to empower
            independent developers. Our platform builds on that foundation,
            extending it into a global, crowd-sourced initiative.
          </Text>

          <Text mb={5}>
            To learn more about the Indie Collective and their ongoing efforts,
            visit their website.
          </Text>

          <Heading mb={5} size="md">
            Together, let's map the indie game world and make it easier to
            discover, connect, and celebrate creativity.
          </Heading>
        </Box>
      </Box>
    </Box>
  );
};

export default AboutPage;
