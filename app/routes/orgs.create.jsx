import { Box, Heading } from '@chakra-ui/react';
import { redirect, useActionData, useLoaderData, useNavigation } from 'react-router';
import { useEffect } from 'react';

import { createOrganization } from '../data/organizations.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { notifyDiscord } from '../utils/discordNotification.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import OrgForm from '../components/OrgForm';
import { checkBlueskyHandle } from '../utils/bluesky.server';

export async function action(args) {
  const { request } = args;

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await parseFormWithUploads(request, ['logo']);

  const location = {
    street: data.get('street'),
    city: data.get('city'),
    region: data.get('region'),
    country_code: data.get('country_code'),
    latitude: parseFloat(data.get('latitude')) || null,
    longitude: parseFloat(data.get('longitude')) || null,
  };

  try {
    const org = await createOrganization({
      name: data.get('name'),
      type: data.get('type').toLowerCase(),
      site: data.get('site'),
      // Throws a message for the form if it doesn't resolve (#161).
      bskyHandle: await checkBlueskyHandle(data.get('bsky_handle')),
      about: data.get('about'),
      location,
      logoId: data.get('logo'),
      authorId: currentUser.id,
    });

    const port = process.env.PORT ?? 3000;
    const BASE_URL = process.env.BASE_URL ?? `http://localhost:${port}`;

    await notifyDiscord(
      `${currentUser.username} added ${data
        .get('type')
        .toLowerCase()} "${data.get(
        'name'
      )}" at ${new Date().toISOString()} - ${BASE_URL}/org/${org.id}`
    );

    return redirect(`/org/${org.id}`);
  } catch (err) {
    const values = Object.fromEntries(data);
    return { error: err.message, values };
  }
}

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);

  const currentUser = await isAuthenticated(request, true);

  return {
    values: {
      name: searchParams.get('name') || '',
      // Pre-selected from the studios or associations list (#86).
      ...(['studio', 'association'].includes(searchParams.get('type')) && {
        type: searchParams.get('type'),
      }),
    },
    currentUser,
  };
};

export const meta = () => [{
  title: 'Add an organization'
}];

const CreateOrg = () => {
    const navigation = useNavigation();
  const loaderData = useLoaderData();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    // Deferred: creating a toast while React commits triggers flushSync.
    queueMicrotask(() =>
      toaster.create({
        title: 'Something went wrong',
        description: actionData?.error,
        type: 'error',
      })
    );
  }, [actionData?.error, navigation.state === 'submitting']);

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Add Organization</Heading>

      <OrgForm
        method="post"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </Box>
  );
};

export default CreateOrg;
