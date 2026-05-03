import { redirect, useLoaderData, useSubmit  } from 'react-router';
import {
    Heading,
  Table,
  TableCaption,
  Icon,
  Switch,
  IconButton,
  Link as ChakraLink,
  Avatar,
  Box,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { FaDiscord, FaGithub } from 'react-icons/fa6';

import { authenticator } from '../../utils/auth.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { db } from '../../utils/db.server';
import computePerson from '../../models/person';
import { Tooltip } from '../../components/ui/tooltip';

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

  return redirect('/admin/users');
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

  const people = await db.person.findMany({
    select: {
      id: true,
      created_at: true,
      username: true,
      first_name: true,
      last_name: true,
      email: true,
      github_id: true,
      discord_id: true,
      isAdmin: true,
      avatar: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

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
    people: await Promise.all(people.map(computePerson)),
    nbOfPeople: await db.person.count(),
    lastChanges,
  };

  return data;
};

export const meta = () => [
  {
    title: 'Users - Community Administration',
  },
];

const Profile = () => {
  const submit = useSubmit();
  const { currentUser, people, nbOfPeople, lastChanges } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Users
      </Heading>
      <Table.ScrollArea>
        <Table.Root variant="simple">
          <Table.Caption>Current users ({nbOfPeople})</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Socials</Table.ColumnHeader>
              <Table.ColumnHeader>
                <Tooltip content="Managed on Discord">
                  <Text as="span">
                    Admin <Icon name="QuestionIcon" />
                  </Text>
                </Tooltip>
              </Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {people.map(
              ({
                id,
                created_at,
                avatar,
                username,
                first_name,
                last_name,
                email,
                discord_url,
                github_url,
                isAdmin,
              }) => (
                <Table.Row key={id}>
                  <Table.Cell>
                    <Avatar.Root size="xs" verticalAlign="middle" mr={2}>
                      <Avatar.Fallback name={first_name} />
                      <Avatar.Image src={avatar && avatar.thumbnail_url} />
                    </Avatar.Root>
                    <b>
                      {first_name}&nbsp;
                      {last_name}
                    </b>{' '}
                    <Text as="span" color={isAdmin && 'blue.500'}>
                      {username}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{email}</Table.Cell>
                  <Table.Cell>
                    {discord_url && (
                      <IconButton
                        colorPalette="discord"
                        size="xs"
                        isExternal
                        asChild
                      >
                        <ChakraLink href={discord_url}>
                          <FaDiscord />
                        </ChakraLink>
                      </IconButton>
                    )}
                    {github_url && (
                      <IconButton
                        colorPalette="github"
                        size="xs"
                        isExternal
                        asChild
                      >
                        <ChakraLink href={github_url}>
                          <FaGithub />
                        </ChakraLink>
                      </IconButton>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Switch
                      colorPalette="blue"
                      name="isAdmin"
                      checked={isAdmin}
                      value="on"
                      disabled
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <time dateTime={created_at} title={created_at}>
                      {formatDistanceToNow(new Date(created_at), {
                        addSuffix: true,
                      })}
                    </time>
                  </Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Socials</Table.ColumnHeader>
              <Table.ColumnHeader>
                <Tooltip content="Managed on Discord">
                  <Text as="span">
                    Admin <Icon name="QuestionIcon" />
                  </Text>
                </Tooltip>
              </Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
            </Table.Row>
          </Table.Footer>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
};

export default Profile;
