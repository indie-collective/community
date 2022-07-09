import {
  Avatar,
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Stack,
  Flex,
  Switch,
  FormLabel,
  useColorMode,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';

import { authenticator } from '../utils/auth.server';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const data = {
    currentUser,
  };

  return json(data);
};

export const meta = ({ data }) => ({
  title: `${data.currentUser.first_name}'s profile`,
});

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const { currentUser } = useLoaderData();
  const { email, first_name, about, avatar, discord_id, github_id } =
    currentUser;

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Profile</Heading>

      <Stack
        spacing={5}
        borderWidth="1px"
        mb={10}
        p={3}
        borderRadius={5}
        align="center"
        position="relative"
      >
        <Box position="absolute" alignSelf="flex-end">
          <Button leftIcon={<EditIcon />} as={Link} to="/profile/edit">
            Edit
          </Button>
        </Box>

        <Avatar size="2xl" name={first_name} margin="1rem" src={avatar} />

        <Heading as="h3">{first_name}</Heading>
        <Heading size="md">{email}</Heading>

        {discord_id && <Text>Discord</Text>}
        {github_id && <Text>GitHub</Text>}

        {about && (
          <Box
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            borderRadius={5}
            alignSelf="stretch"
            padding={5}
          >
            <Text>{about}</Text>
          </Box>
        )}

        <Flex justify="center" align="center">
          <FormLabel htmlFor="dark-mode">Dark mode</FormLabel>
          <Switch
            id="dark-mode"
            colorScheme="teal"
            checked={colorMode === 'dark'}
            onChange={toggleColorMode}
          />
        </Flex>
      </Stack>

      <Stack align="center">
        <Form action="/logout" method="post" to="/logout">
          <Button variant="link" type="submit">
            Logout
          </Button>
        </Form>
      </Stack>
    </Box>
  );
};

export default Profile;
