import { Box, Heading, useToast } from '@chakra-ui/react';
import {
  json,
  redirect,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import Navigation from '../components/Navigation';
import OrgForm from '../components/OrgForm';

export async function action({ request }) {
  const data = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      createUploadHandler(['logo']),
      unstable_createMemoryUploadHandler()
    )
  );

  const location = {
    street: data.get('street'),
    city: data.get('city'),
    region: data.get('region'),
    country_code: data.get('country_code'),
    latitude: parseFloat(data.get('latitude')) || null,
    longitude: parseFloat(data.get('longitude')) || null,
  };

  try {
    const org = await db.entity.create({
      data: {
        name: data.get('name'),
        type: data.get('type').toLowerCase(),
        site: data.get('site'),
        about: data.get('about'),
        // igdb_slug,
        location: Object.values(location).some((l) => l !== null)
          ? {
              connectOrCreate: {
                where: {
                  street_city_region_country_code_latitude_longitude: location,
                },
                create: location,
              },
            }
          : undefined,
        logo: {
          connect: {
            id: data.get('logo'),
          }
        }
      },
      select: {
        id: true,
      },
    });

    return redirect(`/org/${org.id}`);
  } catch (err) {
    const values = Object.fromEntries(data);
    return json({ error: err.message, values });
  }
}

export const meta = () => ({
  title: 'Add an organization',
});

const CreateOrg = () => {
  const toast = useToast();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    toast({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
    });
  }, [actionData?.error, transition.state === 'submitting', toast]);

  return (
    <div>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Create organization</Heading>

        <OrgForm
          method="post"
          loading={transition.state === 'submitting'}
          defaultData={actionData?.values}
        />
      </Box>
    </div>
  );
};

export default CreateOrg;
