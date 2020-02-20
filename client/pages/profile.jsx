import gql from 'graphql-tag';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { Avatar, Box, Heading, Text, Spinner, Button, Stack } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';

const profileQuery = gql`
  query profile {
    currentPerson {
      id
      fullName
      about
      createdAt
    }
  }
`;

const Profile = ({id}) => {
  const { loading, error, data } = useQuery(profileQuery, {
    variables: {},
  });
  const apolloClient = useApolloClient();
  const {push} = useRouter();

  if (loading) {
    return <Spinner />;
  }

  if (!data.currentPerson) {
    push('/signin');
    return;
  }

  const {
    fullName,
    about,
    createdAt,
  } = data.currentPerson;

  return (
    <div>
      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Profile</Heading>

        <Stack spacing={5} border="1px solid #eee" mb={10} p={3} borderRadius={5} align="center" position="relative">
          <Box position="absolute" alignSelf="flex-end">
            <Link href="/profile/edit">
              <Button leftIcon="edit">Edit</Button>
            </Link>
          </Box>

          <Avatar size="2xl" name={fullName} margin="1rem" />

          <Heading>{fullName}</Heading>

          {about && (
            <Box bg="#eeeeee" borderRadius={5} alignSelf="stretch" padding={5}>
              <Text>{about}</Text>
            </Box>
          )}
        </Stack>

        <Stack align="center">
          <Button variant="link" onClick={e => {
            localStorage.clear();
            apolloClient.resetStore();

            push('/');
          }}>
            Logout
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

Profile.getInitialProps = async (ctx) => {
  const {data} = await ctx.apolloClient.query({
    query: gql`
      query isLoggedIn {
        currentPerson {
          id
        }
      }
    `,
  });

  if (!data.currentPerson && ctx.res) {
    ctx.res.writeHead(302, { Location: '/signin' })
    ctx.res.end()
  }

  return {};
}

export default withApollo({ssr: true})(Profile);
