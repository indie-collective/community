import { gql, useQuery, useMutation } from '@apollo/client';
import { Box, Heading, Spinner, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import ProfileForm from '../../components/ProfileForm';
import uploadImageMutation from '../../gql/sendImage.gql';

const profileQuery = gql`
  query profile {
    currentPerson {
      id
      firstName
      lastName
      avatar {
        url
      }
      about
    }
  }
`;

const updateProfileMutation = gql`
  mutation updateProfile(
    $id: UUID!
    $firstName: String!
    $lastName: String
    $avatarId: UUID
    $about: String
  ) {
    updatePerson(
      input: {
        id: $id
        patch: {
          firstName: $firstName
          lastName: $lastName
          avatarId: $avatarId
          about: $about
        }
      }
    ) {
      person {
        id
        firstName
        lastName
        avatar {
          url
        }
        about
      }
    }
  }
`;

const Profile = ({}) => {
  const { loading, error, data } = useQuery(profileQuery, {
    variables: {},
  });
  const [uploadImage, {loading: loadingAvatar}] = useMutation(gql(uploadImageMutation));
  const [updateProfile, {loading: loadingUpdate}] = useMutation(updateProfileMutation);
  const { push } = useRouter();

  if (loading) {
    return <Spinner />;
  }

  if (!data.currentPerson) {
    push('/signin');
    return;
  }

  const handleFormSubmit = async ({ firstName, lastName, avatar: avatarFiles, about }) => {
    let avatarId;

    if (avatarFiles[0]) {
      const response = await uploadImage({
        variables: {
          file: avatarFiles[0],
        },
      });

      avatarId = response.data.createImage.image.id;
    }

    await updateProfile({
      variables: {
        id: data.currentPerson.id,
        firstName,
        lastName,
        avatarId,
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

        <Stack borderWidth="1px" mb={10} p={3} borderRadius={5} align="stretch">
          <ProfileForm
            defaultData={data.currentPerson}
            onSubmit={handleFormSubmit}
            loading={loadingUpdate || loadingAvatar}
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
