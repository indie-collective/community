import { json, redirect } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Icon,
  Tooltip,
  Switch,
  IconButton,
  Link as ChakraLink,
  Avatar,
  Box,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';

import { authenticator } from '../../utils/auth.server';
import { db } from '../../utils/db.server';
import computePerson from '../../models/person';
import { DiscordIcon } from '../../components/DiscordIcon';
import { GitHubIcon } from '../../components/GitHubIcon';

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

  return redirect('/admin/users');
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

  return json(data);
};

export const meta = () => ({
  title: 'Users - Community Administration',
});

const Profile = () => {
  const submit = useSubmit();
  const { currentUser, people, nbOfPeople, lastChanges } = useLoaderData();

  return (
    <Box mb={5} pl={5} pr={5} mt={5}>
      <Heading as="h2" mb={5} size="2xl">
        Users
      </Heading>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Current users ({nbOfPeople})</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Socials</Th>
              <Th>
                <Tooltip label="Managed on Discord">
                  <Text as="span">
                    Admin <Icon name="QuestionIcon" />
                  </Text>
                </Tooltip>
              </Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
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
                <Tr key={id}>
                  <Td>
                    <Avatar
                      name={first_name}
                      src={avatar && avatar.thumbnail_url}
                      size="xs"
                      verticalAlign="middle"
                      mr={2}
                    />
                    <b>
                      {first_name}&nbsp;
                      {last_name}
                    </b>{' '}
                    <Text as="span" color={isAdmin && 'blue.500'}>
                      {username}
                    </Text>
                  </Td>
                  <Td>{email}</Td>
                  <Td>
                    {discord_url && (
                      <IconButton
                        as={ChakraLink}
                        href={discord_url}
                        icon={<DiscordIcon />}
                        colorScheme="discord"
                        size="xs"
                        isExternal
                      />
                    )}
                    {github_url && (
                      <IconButton
                        as={ChakraLink}
                        href={github_url}
                        icon={<GitHubIcon />}
                        colorScheme="github"
                        size="xs"
                        isExternal
                      />
                    )}
                  </Td>
                  <Td>
                    <Switch
                      colorScheme="blue"
                      name="isAdmin"
                      isChecked={isAdmin}
                      value="on"
                      disabled
                    />
                  </Td>
                  <Td>
                    <time datetime={created_at} title={created_at}>
                      {formatDistanceToNow(new Date(created_at), {
                        addSuffix: true,
                      })}
                    </time>
                  </Td>
                </Tr>
              )
            )}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Socials</Th>
              <Th>
                <Tooltip label="Managed on Discord">
                  <Text as="span">
                    Admin <Icon name="QuestionIcon" />
                  </Text>
                </Tooltip>
              </Th>
              <Th>Created</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Profile;
