import { Box, Heading, Stack } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import OrgForm from '../../components/OrgForm';

const createOrgMutation = gql`
  mutation createOrg($name: String!, $type: EntityType!, $about: String) {
    createOrg: createEntity(
      input: { entity: { type: $type, name: $name, about: $about } }
    ) {
      org: entity {
        id
        name
        type
        about

        people {
          totalCount
        }

        games {
          totalCount
        }

        images {
          totalCount
        }

        events {
          totalCount
        }
      }
    }
  }
`;

const CreateOrg = () => {
  const { push } = useRouter();

  // const [uploadImage, { loading: loadingImage }] = useMutation(
  //   gql(uploadImageMutation)
  // );
  const [createOrg, { loading }] = useMutation(createOrgMutation);

  async function handleFormSubmit({ name, type, about }) {
    const response = await createOrg({
      variables: {
        name,
        type,
        about,
      },
    });

    push(`/org/${response.data.createOrg.org.id}`);
  }

  return (
    <div>
      <Head>
        <title>Create a new organization</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Create organization</Heading>

        <Stack borderWidth="1px" mb={10} p={3} borderRadius={5} align="stretch">
          <OrgForm onSubmit={handleFormSubmit} loading={loading} />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateOrg);
