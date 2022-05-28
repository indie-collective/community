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
import { Link, useLoaderData } from '@remix-run/react';

import Navigation from '../components/Navigation';

export const loader = () => {
  const data = {
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      about: '',
      avatar: null,
    },
  };

  return json(data);
}

export const meta = ({data}) => ({
  title: `${data.currentUser.name}'s profile`,
});

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const { currentUser } = useLoaderData();
  const { fullName, about, avatar } = currentUser;

  return (
    <div>
      <Navigation />

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
            <Link to="/profile/edit">
              <Button leftIcon={<EditIcon />}>Edit</Button>
            </Link>
          </Box>

          <Avatar
            size="2xl"
            name={fullName}
            margin="1rem"
            src={avatar && avatar.url}
          />

          <Heading>{fullName}</Heading>

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
              isChecked={colorMode === 'dark'}
              onChange={toggleColorMode}
            />
          </Flex>
        </Stack>

        <Stack align="center">
          <Link to="/logout">
            <Button variant="link">Logout</Button>
          </Link>
        </Stack>
      </Box>
    </div>
  );
};

export default Profile;
