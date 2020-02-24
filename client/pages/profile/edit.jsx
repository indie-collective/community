import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Box, Heading, Text, Spinner, Stack } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import ProfileForm from '../../components/ProfileForm';

const profileQuery = gql`
  query profile {
    currentPerson {
      id
      firstName
      lastName
      about
    }
  }
`;

const updateProfileMutation = gql`
  mutation updateProfile(
    $id: UUID!
    $firstName: String!
    $lastName: String
    $about: String
  ) {
    updatePerson(
      input: {
        id: $id
        patch: { firstName: $firstName, lastName: $lastName, about: $about }
      }
    ) {
      person {
        id
        firstName
        lastName
        about
      }
    }
  }
`;

const Profile = ({}) => {
  const { loading, error, data } = useQuery(profileQuery, {
    variables: {},
  });
  const [updateProfile] = useMutation(updateProfileMutation);
  const { push } = useRouter();

  if (loading) {
    return <Spinner />;
  }

  if (!data.currentPerson) {
    push('/signin');
    return;
  }

  const handleFormSubmit = async ({ avatar, firstName, lastName, about }) => {
    await updateProfile({
      variables: {
        id: data.currentPerson.id,
        firstName,
        lastName,
        about,
      },
    });

    push('/profile');
  };

  return (
    <div>
      <Head>
        <title>Edit profile</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Profile</Heading>

        <Stack
          borderWidth="1px"
          mb={10}
          p={3}
          borderRadius={5}
          align="stretch"
        >
          <ProfileForm
            defaultData={data.currentPerson}
            onSubmit={handleFormSubmit}
            loading={false}
          />
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
