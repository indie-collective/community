import { Box, Heading, useToast } from '@chakra-ui/react';
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useActionData, useLoaderData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import { authenticator, authorizer, canWrite } from '../utils/auth.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import OrgForm from '../components/OrgForm';

export async function action(args) {
  const { request } = args;

  await authorizer.authorize(args, {
    rules: [canWrite],
  });

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
        logo: data.get('logo')
          ? {
              connect: {
                id: data.get('logo'),
              },
            }
          : undefined,
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

export const loader = async ({ request }) => {
  const { pathname, search, searchParams } = new URL(request.url);

  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: `/signin?redirect=${pathname}?${search}`,
  });

  return json({
    values: {
      name: searchParams.get('name') || '',
    },
    currentUser,
  });
};

export const meta = () => ({
  title: 'Add an organization',
});

const CreateOrg = () => {
  const toast = useToast();
  const transition = useTransition();
  const loaderData = useLoaderData();
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
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Create organization</Heading>

      <OrgForm
        method="post"
        loading={transition.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </Box>
  );
};

export default CreateOrg;
