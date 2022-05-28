import { Box, Heading, useToast } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import Navigation from '../components/Navigation';
import OrgForm from '../components/OrgForm';

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const org = await db.entity.findUnique({
    where: { id },
    include: {
      logo: true,
      location: true,
    },
  });

  const data = {
    org: {
      ...org,
      type: org.type.toUpperCase(),
    },
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
    },
  };

  return json(data);
};

export const meta = ({ data }) => ({
  title: `Edit "${data.org.name}" | Organizations`,
});

const EditOrg = () => {
  const toast = useToast();
  const { org } = useLoaderData();

  const { id } = org;

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
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Update organization</Heading>

        <OrgForm
          defaultData={org}
          onSubmit={handleFormSubmit}
          loading={false}
        />
      </Box>
    </div>
  );
};

export default EditOrg;
