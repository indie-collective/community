import { json, redirect } from '@remix-run/node';
import { useLoaderData, Form, Link, useSubmit } from '@remix-run/react';
import {
  Heading,
  Link as ChakraLink,
  Text,
  ListItem,
  List,
  Box,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';

import { authenticator } from '../../utils/auth.server';
import { db } from '../../utils/db.server';
import { FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';

export const action = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Forbidden', {
      status: 403,
    });
  }

  const data = await request.formData();

  await db.person.update({
    where: {
      id: data.get('userId'),
    },
    data: {
      isAdmin: data.get('isAdmin') === 'on',
    },
  });

  return redirect('/admin');
};

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  const lastChanges = await db.game_change.findMany({
    orderBy: {
      created_at: 'desc',
    },
    take: 10,
    select: {
      id: true,
      operation: true,
      created_at: true,
      game: {
        select: {
          id: true,
          name: true,
        },
      },
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          isAdmin: true,
        },
      },
    },
  });

  const data = {
    currentUser,
    lastChanges,
  };

  return json(data);
};

export const meta = () => ({
  title: 'Last Changes - Community Administration',
});

const operationsColors = {
  create: 'green.500',
  update: 'blue.500',
  delete: 'red.500',
};

const operationsIcons = {
  create: FiPlus,
  update: FiEdit,
  delete: FiTrash2,
};

const Profile = () => {
  const { lastChanges } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Last changes
      </Heading>

      <List spacing={2} pl={5}>
        {lastChanges.map(({ id, operation, author, game, created_at }) => (
          <ListItem>
            <ListIcon as={operationsIcons[operation]} color={operationsColors[operation]} />
            {author.first_name} {author.last_name}{' '}
            <ChakraLink as={Link} to={`/game/${game.id}/changes/${id}`}>
              {operation}d
            </ChakraLink>{' '}
            <ChakraLink as={Link} to={`/game/${game.id}`}>
              {game.name}
            </ChakraLink>{' '}
            <Text as="span" opacity={0.6}>
              {formatDistanceToNow(new Date(created_at), {
                addSuffix: true,
              })}
            </Text>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Profile;
