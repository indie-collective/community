import { redirect, useLoaderData, Form, Link, useSubmit  } from 'react-router';
import {
    Heading,
  Link as ChakraLink,
  Box,
  IconButton,
  Stat,
  Menu,
  HStack,
  Portal,
} from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';

import { authenticator } from '../../utils/auth.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { db } from '../../utils/db.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, {
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

  return {
    games_missing_images,
    games_missing_source,
    games_missing_tags,
    entities_missing_games,
    entities_missing_location,
  };
};

export const meta = () => [
  {
    title: 'Users - Community Administration',
  },
];

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

        <HStack mt={5} gap={10}>
          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton icon={<LuChevronDown />} size="lg"></IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    {games_missing_images.slice(0, 10).map(({ id, name }) => (
                      <Menu.Item value="item-0" asChild>
                        <ChakraLink key={id} href={`/game/${id}`}>
                          {name}
                        </ChakraLink>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Stat.Root>
              <Stat.Label>Missing images</Stat.Label>
              <Stat.ValueText>{games_missing_images.length}</Stat.ValueText>
            </Stat.Root>
          </HStack>

          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton icon={<LuChevronDown />} size="lg"></IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    {games_missing_source.slice(0, 10).map(({ id, name }) => (
                      <Menu.Item value="item-1" asChild>
                        <ChakraLink key={id} href={`/game/${id}`}>
                          {name}
                        </ChakraLink>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Stat.Root>
              <Stat.Label>Made by nobody</Stat.Label>
              <Stat.ValueText>{games_missing_source.length}</Stat.ValueText>
            </Stat.Root>
          </HStack>

          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton icon={<LuChevronDown />} size="lg"></IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    {games_missing_tags.slice(0, 10).map(({ id, name }) => (
                      <Menu.Item value="item-2" asChild>
                        <ChakraLink key={id} href={`/game/${id}`}>
                          {name}
                        </ChakraLink>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Stat.Root>
              <Stat.Label>Without tags</Stat.Label>
              <Stat.ValueText>{games_missing_tags.length}</Stat.ValueText>
            </Stat.Root>
          </HStack>
        </HStack>
      </Box>
      <Box mt={15}>
        <Heading>Studios & Associations</Heading>

        <HStack mt={5} gap={10}>
          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton icon={<LuChevronDown />} size="lg"></IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    {entities_missing_games.slice(0, 10).map(({ id, name }) => (
                      <Menu.Item value="item-3" asChild>
                        <ChakraLink key={id} href={`/org/${id}`}>
                          {name}
                        </ChakraLink>
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Stat.Root>
              <Stat.Label>Making nothing</Stat.Label>
              <Stat.ValueText>{entities_missing_games.length}</Stat.ValueText>
            </Stat.Root>
          </HStack>

          <HStack gap={3}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton icon={<LuChevronDown />} size="lg"></IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    {entities_missing_location
                      .slice(0, 10)
                      .map(({ id, name }) => (
                        <Menu.Item value="item-4" asChild>
                          <ChakraLink key={id} href={`/org/${id}`}>
                            {name}
                          </ChakraLink>
                        </Menu.Item>
                      ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
            <Stat.Root>
              <Stat.Label>Based nowhere</Stat.Label>
              <Stat.ValueText>
                {entities_missing_location.length}
              </Stat.ValueText>
            </Stat.Root>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default Missing;
