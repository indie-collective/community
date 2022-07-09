import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Box,
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
  useColorMode,
} from '@chakra-ui/react';

import { authenticator } from '../../utils/auth.server';
import Navigation from '../../components/Navigation';
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
    },
  });

  const data = {
    currentUser,
    people,
  };

  return json(data);
};

export const meta = () => ({
  title: 'Community Administration',
});

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentUser, people } = useLoaderData();

  return (
    <div>
      <Navigation />

      <Heading mb={5} mt={10}>Admin</Heading>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Current users</TableCaption>
          <Thead>
            <Tr>
              <Th>Created</Th>
              <Th>Admin</Th>
              <Th>First name</Th>
              <Th>Last name</Th>
              <Th>Email</Th>
              <Th>Discord</Th>
              <Th>Github</Th>
            </Tr>
          </Thead>
          <Tbody>
            {people.map(
              ({
                id,
                created_at,
                first_name,
                last_name,
                email,
                github_id,
                discord_id,
                isAdmin,
              }) => (
                <Tr key={id}>
                  <Td>{created_at}</Td>
                  <Td>{isAdmin}</Td>
                  <Td>{first_name}</Td>
                  <Td>{last_name}</Td>
                  <Td>{email}</Td>
                  <Td>{discord_id}</Td>
                  <Td>{github_id}</Td>
                </Tr>
              )
            )}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Created</Th>
              <Th>Admin</Th>
              <Th>First name</Th>
              <Th>Last name</Th>
              <Th>Email</Th>
              <Th>Discord</Th>
              <Th>Github</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Profile;
