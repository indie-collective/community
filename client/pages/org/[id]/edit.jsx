import { Box, Heading, Spinner, Stack } from '@chakra-ui/react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../../lib/apollo';
import uploadImageMutation from '../../../gql/sendImage.gql';
import Navigation from '../../../components/Navigation';
import OrgForm from '../../../components/OrgForm';

const getOrgQuery = gql`
  query getOrg($id: UUID!) {
    org: entity(id: $id) {
      id
      name
      type
      logo {
        url
      }
      location {
        id
        street
        city
        region
        countryCode
        latitude
        longitude
      }
      site
      about
    }
  }
`;

const updateOrgMutation = gql`
  mutation updateOrg(
    $id: UUID!
    $name: String
    $type: EntityType
    $logoId: UUID
    $locationId: UUID
    $about: String
    $site: String
  ) {
    updateOrg: updateEntity(
      input: {
        id: $id
        patch: {
          name: $name
          type: $type
          logoId: $logoId
          locationId: $locationId
          site: $site
          about: $about
        }
      }
    ) {
      org: entity {
        id
        name
        type
        logo {
          url
          thumbnail_url
        }
        location {
          id
          street
          city
          region
          countryCode
          latitude
          longitude
        }
        site
        about
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

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const EditOrg = ({ id }) => {
  const validId = uuidRegex.test(id);
  const { push } = useRouter();

  const { loading, error, data } = useQuery(getOrgQuery, {
    variables: { id },
    skip: !validId,
  });
  const [uploadImage, { loading: loadingLogo }] = useMutation(
    gql(uploadImageMutation)
  );
  const [upsertLocation, { loading: loadingLocation }] = useMutation(
    upsertLocationMutation
  );
  const [updateOrg, { loadingUpdate }] = useMutation(updateOrgMutation);

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

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
      const response = await upsertLocation({
        variables: location.value,
      });

      locationId =
        response.data
          .upsertLocationByStreetAndCityAndRegionAndCountryCodeAndLatitudeAndLongitude
          .location.id;
    }

    const response = await updateOrg({
      variables: {
        id,
        name,
        type,
        logoId,
        locationId,
        site,
        about,
      },
    });

    push(`/org/${response.data.updateOrg.org.id}`);
  }

  return (
    <div>
      <Head>
        <title>Update organization</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Update organization</Heading>

        <Stack borderWidth="1px" mb={10} p={3} borderRadius={5} align="stretch">
          <OrgForm
            defaultData={data && data.org}
            onSubmit={handleFormSubmit}
            loading={loadingUpdate || loadingLogo}
          />
        </Stack>
      </Box>
    </div>
  );
};

EditOrg.getInitialProps = async (context) => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ ssr: true })(EditOrg);
