import { Box, Heading, Stack } from '@chakra-ui/react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import OrgForm from '../../components/OrgForm';

const createOrgMutation = gql`
  mutation createOrg($name: String!, $type: EntityType!, $logoId: UUID, $about: String) {
    createOrg: createEntity(
      input: { entity: { name: $name, type: $type, logoId: $logoId, about: $about } }
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

  const [uploadImage, { loading: loadingLogo }] = useMutation(
    gql(uploadImageMutation)
  );
  const [createOrg, { loading }] = useMutation(createOrgMutation);

  async function handleFormSubmit({ name, type, logo: logoFiles, about }) {
    let logoId;

    if (logoFiles[0]) {
      const response = await uploadImage({
        variables: {
          file: logoFiles[0],
        },
      });

      logoId = response.data.createImage.image.id;
    }

    const response = await createOrg({
      variables: {
        name,
        type,
        logoId,
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
          <OrgForm onSubmit={handleFormSubmit} loading={loading || loadingLogo} />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateOrg);
