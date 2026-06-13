import { redirect, useLoaderData, Form, Link, useSubmit  } from 'react-router';
import { Heading, Link as ChakraLink, Text, List, Box } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';

import isAuthenticated from '../../utils/isAuthenticated.server'
import { db } from '../../utils/db.server';
import { LuPlus, LuTrash2, LuPencil } from 'react-icons/lu';

export const action = async ({ request }) => {
  const currentUser = await isAuthenticated(request, {
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
  const currentUser = await isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser.isAdmin) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  const lastChanges = await db.change.findMany({
    orderBy: {
      created_at: 'desc',
    },
    take: 10,
    select: {
      id: true,
      operation: true,
      created_at: true,
      table_name: true,
      record_id: true,
      data: true,
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

  return data;
};

export const meta = () => [{
  title: 'Last Changes - Community Administration'
}];

const operationsColors = {
  create: 'green.500',
  update: 'blue.500',
  delete: 'red.500',
};

const operationsIcons = {
  create: LuPlus,
  update: LuPencil,
  delete: LuTrash2,
};

const Profile = () => {
  const { lastChanges } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Last changes
      </Heading>
      <List.Root gap={2} pl={5}>
        {lastChanges.map(
          ({
            id,
            operation,
            author,
            table_name,
            record_id,
            data,
            created_at,
          }) => (
            <List.Item>
              <List.Indicator color={operationsColors[operation]} asChild><operationsIcons.operation /></List.Indicator>
              {author?.first_name} {author?.last_name}{' '}
              <ChakraLink asChild><Link
                  to={`/${
                     table_name === 'entity' ? 'org' : table_name
                  }/${record_id}/changes/${id}`}>
                  {operation}d
                                </Link></ChakraLink>{' '}
              <ChakraLink asChild><Link
                  to={`/${
                    table_name === 'entity' ? 'org' : table_name
                  }/${record_id}`}>
                  {data.name}
                </Link></ChakraLink>{' '}
              <Text as="span" opacity={0.6}>
                {formatDistanceToNow(new Date(created_at), {
                  addSuffix: true,
                })}
              </Text>
            </List.Item>
          )
        )}
      </List.Root>
    </Box>
  );
};

export default Profile;
