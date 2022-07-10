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
  useColorMode,
  Icon,
  Tooltip,
  Switch,
} from '@chakra-ui/react';

import { authenticator } from '../../utils/auth.server';
import Navigation from '../../components/Navigation';
import { db } from '../../utils/db.server';
import { formatDistanceToNow } from 'date-fns';

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
      <Heading mb={5} mt={10}>
        Admin
      </Heading>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Current users</TableCaption>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Created</Th>
              <Th>Email</Th>
              <Th>Admin</Th>
            </Tr>
          </Thead>
          <Tbody>
            {people.map(
              ({ id, created_at, first_name, last_name, email, isAdmin }) => (
                <Tr key={id}>
                  <Td>
                    {first_name}&nbsp;
                    {last_name}
                  </Td>
                  <Td>
                    {formatDistanceToNow(new Date(created_at), {
                      addSuffix: true,
                    })}
                    &nbsp;
                    <Tooltip label={created_at}>
                      <Icon name="QuestionIcon" />
                    </Tooltip>
                  </Td>
                  <Td>{email}</Td>
                  <Td>
                    <Switch isChecked={isAdmin} />
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
              <Th>Admin</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Profile;
