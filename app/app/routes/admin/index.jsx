import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';

import { authenticator } from '../../utils/auth.server';
import { db } from '../../utils/db.server';
import computePerson from '../../models/person';
import { DiscordIcon } from '../../components/DiscordIcon';
import { GitHubIcon } from '../../components/GitHubIcon';

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

  const data = {
    currentUser,
    people: await Promise.all(people.map(computePerson)),
    nbOfPeople: await db.person.count(),
  };

  return json(data);
};

export const meta = () => ({
  title: 'Community Administration',
});

const Profile = () => {
  const { currentUser, people, nbOfPeople } = useLoaderData();

  return (
    <div>
      <Heading mb={5} mt={10}>
        Admin
      </Heading>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Current users ({nbOfPeople})</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Created</Th>
              <Th>Email</Th>
              <Th>Socials</Th>
              <Th>Admin</Th>
              <Th>Restricted</Th>
            </Tr>
          </Thead>
          <Tbody>
            {people.map(
              ({
                id,
                created_at,
                avatar,
                first_name,
                last_name,
                email,
                discord_id,
                github_username,
                isAdmin,
                isRestricted = false,
              }) => (
                <Tr key={id}>
                  <Td color={isRestricted && 'gray.500'}>
                    <Avatar
                      name={first_name}
                      src={avatar && avatar.thumbnail_url}
                      size="xs"
                      verticalAlign="middle"
                      mr={2}
                    />
                    {first_name}&nbsp;
                    {last_name}
                  </Td>
                  <Td color={isRestricted && 'gray.500'}>
                    {formatDistanceToNow(new Date(created_at), {
                      addSuffix: true,
                    })}
                    &nbsp;
                    <Tooltip label={created_at}>
                      <Icon name="QuestionIcon" />
                    </Tooltip>
                  </Td>
                  <Td color={isRestricted && 'gray.500'}>{email}</Td>
                  <Td color={isRestricted && 'gray.500'}>
                    {discord_id && (
                      <IconButton
                        as={ChakraLink}
                        href={`https://discord.com/users/${discord_id}`}
                        icon={<DiscordIcon />}
                        colorScheme="discord"
                        size="xs"
                        isExternal
                      />
                    )}
                    {github_username && (
                      <IconButton
                        as={ChakraLink}
                        href={`https://github.com/${github_username}`}
                        icon={<GitHubIcon />}
                        colorScheme="github"
                        size="xs"
                        isExternal
                      />
                    )}
                  </Td>
                  <Td>
                    <Switch
                      isChecked={isAdmin}
                      disabled={isRestricted || currentUser.id === id}
                    />
                  </Td>
                  <Td>
                    <Switch
                      colorScheme="red"
                      isChecked={isRestricted}
                      disabled={currentUser.id === id}
                    />
                  </Td>
                </Tr>
              )
            )}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Name</Th>
              <Th>Created</Th>
              <Th>Email</Th>
              <Th>Socials</Th>
              <Th>Admin</Th>
              <Th>Restricted</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Profile;
