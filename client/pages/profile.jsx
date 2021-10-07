import { gql, useQuery, useApolloClient } from '@apollo/client';
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
import Link from 'next/link';
import Head from 'next/head';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';

const profileQuery = gql`
  query profile {
    currentPerson {
      id
      fullName
      about
      avatar {
        url
      }
      createdAt
    }
  }
`;

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const apolloClient = useApolloClient();

  const { loading, error, data } = useQuery(profileQuery, {
    variables: {},
  });

  if (loading) {
    return <Spinner />;
  }

  const { fullName, about, avatar, createdAt } = data.currentPerson;

  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>

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
            <Link href="/profile/edit">
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
          <Button
            variant="link"
            onClick={async (e) => {
              await apolloClient.resetStore();

              window.location = '/api/auth/logout';
            }}
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo({ ssr: true })(withPageAuthRequired(Profile));
