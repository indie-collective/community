import { redirect, useLoaderData, useSubmit  } from 'react-router';
import {
    Heading,
  Table,
  Icon,
  NativeSelect,
  IconButton,
  Link as ChakraLink,
  Avatar,
  Box,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { FaBluesky, FaDiscord } from 'react-icons/fa6';
import { LuCircleHelp } from 'react-icons/lu';

import isAuthenticated from '../../utils/isAuthenticated.server';
import { countPeople, listPeople, setRole } from '../../data/people.server';
import { PERSON_ROLES } from '../../db/schema.js';
import { listRecentChanges } from '../../data/changes.server';
import { Tooltip } from '../../components/ui/tooltip';

export const action = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  if (!currentUser.isAdmin) {
    throw new Response('Forbidden', {
      status: 403,
    });
  }

  const data = await request.formData();
  const userId = data.get('userId');
  const role = data.get('role');

  if (!PERSON_ROLES.includes(role)) {
    throw new Response('Bad Request', { status: 400 });
  }
  // An admin can't change their own role, so there's always one left.
  if (userId === currentUser.id) {
    throw new Response('Forbidden', { status: 403 });
  }

  await setRole(userId, role);

  return redirect('/admin/users');
};

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  if (!currentUser.isAdmin) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  const data = {
    currentUser,
    people: await listPeople(),
    nbOfPeople: await countPeople(),
    lastChanges: await listRecentChanges({ limit: 10 }),
  };

  return data;
};

export const meta = () => [
  {
    title: 'Users - Community Administration',
  },
];

const ROLE_LABELS = [
  ['admin', 'Admin'],
  ['member', 'Member'],
  ['restricted', 'Restricted'],
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
                <Tooltip content="Admins can do everything; members can edit; restricted people can't edit.">
                  <Text as="span">
                    Role{' '}
                    <Icon>
                      <LuCircleHelp />
                    </Icon>
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
                isAdmin,
                role,
                bluesky_linked,
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
                    {bluesky_linked && (
                      <Icon color="blue.500" mr={2} aria-label="Bluesky linked">
                        <FaBluesky />
                      </Icon>
                    )}
                    {discord_url && (
                      <IconButton
                        colorPalette="discord"
                        size="xs"
                        asChild
                      >
                        <ChakraLink
                          href={discord_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaDiscord />
                        </ChakraLink>
                      </IconButton>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <NativeSelect.Root size="sm" width="9rem" disabled={id === currentUser.id}>
                      <NativeSelect.Field
                        aria-label={`Role of ${username}`}
                        value={role}
                        onChange={(event) =>
                          submit(
                            { userId: id, role: event.target.value },
                            { method: 'post' }
                          )
                        }
                      >
                        {ROLE_LABELS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <time dateTime={created_at && new Date(created_at).toISOString()} title={created_at && new Date(created_at).toISOString()}>
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
                <Tooltip content="Admins can do everything; members can edit; restricted people can't edit.">
                  <Text as="span">
                    Role{' '}
                    <Icon>
                      <LuCircleHelp />
                    </Icon>
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
