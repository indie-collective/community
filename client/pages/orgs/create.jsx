import { Box, Heading, Stack, useToast } from '@chakra-ui/react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import OrgForm from '../../components/OrgForm';

const createOrgMutation = gql`
  mutation createOrg(
    $name: String!
    $type: EntityType!
    $logoId: UUID
    $site: String
    $about: String
    $locationId: UUID
  ) {
    createOrg: createEntity(
      input: {
        entity: {
          name: $name
          type: $type
          logoId: $logoId
          site: $site
          about: $about
          locationId: $locationId
        }
      }
    ) {
      org: entity {
        id
        name
        type
        site
        about

        locationId

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

const upsertLocationMutation = gql`
  mutation upsertLocation(
    $street: String
    $city: String!
    $region: String!
    $countryCode: String!
    $latitude: Float!
    $longitude: Float!
  ) {
    upsertLocationByStreetAndCityAndRegionAndCountryCodeAndLatitudeAndLongitude(
      input: {
        location: {
          street: $street
          city: $city
          region: $region
          countryCode: $countryCode
          latitude: $latitude
          longitude: $longitude
        }
        patch: {
          street: $street
          city: $city
          region: $region
          countryCode: $countryCode
          latitude: $latitude
          longitude: $longitude
        }
      }
    ) {
      location {
        id
        countryCode
        region
        city
        latitude
        longitude
      }
    }
  }
`;

const CreateOrg = () => {
  const { push } = useRouter();
  const toast = useToast();

  const [uploadImage, { loading: loadingLogo }] = useMutation(
    gql(uploadImageMutation)
  );
  const [upsertLocation, { loading: loadingLocation }] = useMutation(
    upsertLocationMutation
  );
  const [createOrg, { loading }] = useMutation(createOrgMutation);

  async function handleFormSubmit({
    name,
    type,
    logo: logoFiles,
    location,
    site,
    about,
  }) {
    let logoId;

    if (logoFiles[0]) {
      const response = await uploadImage({
        variables: {
          file: logoFiles[0],
        },
      });

      logoId = response.data.createImage.image.id;
    }

    let locationId = null;

    if (location.value && location.id) {
      locationId = location.id;
    } else if (location.value) {
      try {
        const response = await upsertLocation({
          variables: location.value,
        });

        locationId =
          response.data
            .upsertLocationByStreetAndCityAndRegionAndCountryCodeAndLatitudeAndLongitude
            .location.id;
      } catch (err) {
        toast({
          title: 'Error with location',
          description: err.message,
          status: 'error',
        });
      }
    }

    const response = await createOrg({
      variables: {
        name,
        type,
        logoId,
        locationId,
        site,
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
          <OrgForm
            onSubmit={handleFormSubmit}
            loading={loading || loadingLogo || loadingLocation}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateOrg);
