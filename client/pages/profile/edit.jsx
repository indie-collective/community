import { gql, useQuery, useMutation } from '@apollo/client';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Box, Heading, Spinner } from '@chakra-ui/react';
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

const ProfileEdit = ({}) => {
  const { loading, error, data } = useQuery(profileQuery, {
    variables: {},
  });
  const [uploadImage, { loading: loadingAvatar }] = useMutation(
    gql(uploadImageMutation)
  );
  const [updateProfile, { loading: loadingUpdate }] = useMutation(
    updateProfileMutation
  );
  const { push } = useRouter();

  if (loading) {
    return <Spinner />;
  }

  if (!data.currentPerson) {
    push('/signin');
    return;
  }

  const handleFormSubmit = async ({
    firstName,
    lastName,
    avatar: avatarFiles,
    about,
  }) => {
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

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Profile</Heading>

        <ProfileForm
          defaultData={data.currentPerson}
          onSubmit={handleFormSubmit}
          loading={loadingUpdate || loadingAvatar}
        />
      </Box>
    </div>
  );
};

export default withApollo({ ssr: true })(withPageAuthRequired(ProfileEdit));
