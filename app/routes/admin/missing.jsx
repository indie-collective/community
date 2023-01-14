import { json, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link, useSubmit } from '@remix-run/react';
import {
  Heading,
  Link as ChakraLink,
  Box,
  IconButton,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  HStack,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { authenticator } from '../../utils/auth.server';
import { db } from '../../utils/db.server';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  const games_missing_images = await db.game.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      game_image: {
        none: {},
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const games_missing_source = await db.game.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      AND: {
        game_author: {
          none: {},
        },
        game_entity: {
          none: {},
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const games_missing_tags = await db.game.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      game_tag: {
        none: {},
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const entities_missing_games = await db.entity.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      game_entity: {
        none: {},
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const entities_missing_location = await db.entity.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      location: {
        is: null,
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return json({
    games_missing_images,
    games_missing_source,
    games_missing_tags,
    entities_missing_games,
    entities_missing_location,
  });
};

export const meta = () => ({
  title: 'Users - Community Administration',
});

const Missing = () => {
  const {
    games_missing_images,
    games_missing_source,
    games_missing_tags,
    entities_missing_games,
    entities_missing_location,
  } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Missing data
      </Heading>

      <Box mt={15}>
        <Heading>Games</Heading>

        <HStack mt={5} spacing={10}>
          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<ChevronDownIcon />}
                size="lg"
              />
              <MenuList>
                {games_missing_images.slice(0, 10).map(({ id, name }) => (
                  <MenuItem key={id} as={ChakraLink} href={`/game/${id}`}>
                    {name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Stat>
              <StatLabel>Missing images</StatLabel>
              <StatNumber>{games_missing_images.length}</StatNumber>
            </Stat>
          </HStack>

          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<ChevronDownIcon />}
                size="lg"
              />
              <MenuList>
                {games_missing_source.slice(0, 10).map(({ id, name }) => (
                  <MenuItem key={id} as={ChakraLink} href={`/game/${id}`}>
                    {name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Stat>
              <StatLabel>Made by nobody</StatLabel>
              <StatNumber>{games_missing_source.length}</StatNumber>
            </Stat>
          </HStack>

          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<ChevronDownIcon />}
                size="lg"
              />
              <MenuList>
                {games_missing_tags.slice(0, 10).map(({ id, name }) => (
                  <MenuItem key={id} as={ChakraLink} href={`/game/${id}`}>
                    {name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Stat>
              <StatLabel>Without tags</StatLabel>
              <StatNumber>{games_missing_tags.length}</StatNumber>
            </Stat>
          </HStack>
        </HStack>
      </Box>

      <Box mt={15}>
        <Heading>Studios & Associations</Heading>

        <HStack mt={5} spacing={10}>
          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<ChevronDownIcon />}
                size="lg"
              />
              <MenuList>
                {entities_missing_games.slice(0, 10).map(({ id, name }) => (
                  <MenuItem key={id} as={ChakraLink} href={`/org/${id}`}>
                    {name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Stat>
              <StatLabel>Making nothing</StatLabel>
              <StatNumber>{entities_missing_games.length}</StatNumber>
            </Stat>
          </HStack>

          <HStack spacing={3}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<ChevronDownIcon />}
                size="lg"
              />
              <MenuList>
                {entities_missing_location.slice(0, 10).map(({ id, name }) => (
                  <MenuItem key={id} as={ChakraLink} href={`/org/${id}`}>
                    {name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Stat>
              <StatLabel>Based nowhere</StatLabel>
              <StatNumber>{entities_missing_location.length}</StatNumber>
            </Stat>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default Missing;
