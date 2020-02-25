import gql from 'graphql-tag';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
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
} from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

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

const Profile = ({ id }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { loading, error, data } = useQuery(profileQuery, {
    variables: {},
  });
  const apolloClient = useApolloClient();
  const { push } = useRouter();

  if (loading) {
    return <Spinner />;
  }

  if (!data.currentPerson) {
    push('/signin');
    return;
  }

  const { fullName, about, avatar, createdAt } = data.currentPerson;

  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
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
              <Button leftIcon="edit">Edit</Button>
            </Link>
          </Box>

          <Avatar size="2xl" name={fullName} margin="1rem" src={avatar && avatar.url} />

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
              value={colorMode === 'dark'}
              onChange={toggleColorMode}
            />
          </Flex>
        </Stack>

        <Stack align="center">
          <Button
            variant="link"
            onClick={async e => {
              document.cookies = '';
              await apolloClient.resetStore();

              push('/');
            }}
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

Profile.getInitialProps = async ctx => {
  const { data } = await ctx.apolloClient.query({
    query: gql`
      query isLoggedIn {
        currentPerson {
          id
        }
      }
    `,
  });

  if (!data.currentPerson && ctx.res) {
    ctx.res.writeHead(302, { Location: '/signin' });
    ctx.res.end();
  }

  return {};
};

export default withApollo({ ssr: true })(Profile);
