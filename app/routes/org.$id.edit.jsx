import { Box, Heading } from '@chakra-ui/react';
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
import { authorizer, canWrite } from '../utils/auth.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import OrgForm from '../components/OrgForm';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

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
      logo: org.logo
        ? {
            url: `https://${process.env.CDN_HOST}/${org.logo.image_file.name}`,
            thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${org.logo.image_file.name}`,
          }
        : null,
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

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  await authorizer.authorize(args, {
    rules: [canWrite],
    failureRedirect: `/signin?redirect=/orgs/${id}/edit`,
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
    const [, igdb_slug] =
      (data.get('igdb_url') || '').match(/companies\/(.+)/) || [];

    const org = await db.entity.update({
      where: { id },
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
    console.log(err);

    const values = Object.fromEntries(data);
    return json({ error: 'Updating the organization failed', values });
  }
}

export const meta = ({ data }) => ({
  title: `Edit "${data.org.name}" | Organizations`,
});

const EditOrg = () => {
  const { org } = useLoaderData();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

  }, [actionData?.error, transition.state === 'submitting']);

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Update organization</Heading>

      <OrgForm
        method="post"
        loading={transition.state === 'submitting'}
        defaultData={org}
      />
    </Box>
  );
};

export default EditOrg;
