import { Box } from '@chakra-ui/react';
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import { actionErrorMessage } from '../utils/actionError.server';
import { useEffect } from 'react';

import { createOrganization } from '../data/organizations.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { notifyDiscord } from '../utils/discordNotification.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import OrgForm from '../components/OrgForm';
import { checkBlueskyHandle } from '../utils/bluesky.server';
import getOrigin from '../utils/origin.server';
import { ORGANIZATION_STATUSES } from '../db/schema.js';
import { orgPath } from '../utils/slug';
import { PageHeader } from '../components/Page';

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
      // #39; anything else keeps the current one (or the default).
      status: ORGANIZATION_STATUSES.includes(data.get('status'))
        ? data.get('status')
        : undefined,
      site: data.get('site'),
      // Throws a message for the form if it doesn't resolve (#161).
      bskyHandle: await checkBlueskyHandle(data.get('bsky_handle')),
      about: data.get('about'),
      location,
      logoId: data.get('logo'),
      authorId: currentUser.id,
    });

    const BASE_URL = getOrigin(request);

    await notifyDiscord(
      `${currentUser.username} added ${data
        .get('type')
        .toLowerCase()} "${data.get(
        'name'
      )}" at ${new Date().toISOString()} - ${BASE_URL}${orgPath(org)}`
    );

    return redirect(orgPath(org));
  } catch (err) {
    const values = Object.fromEntries(data);
    return { error: await actionErrorMessage(err), values };
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

export const meta = () => [
  {
    title: 'Add an organization',
  },
];

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
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Add a studio or association" />

      <OrgForm
        method="post"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </Box>
  );
};

export default CreateOrg;
