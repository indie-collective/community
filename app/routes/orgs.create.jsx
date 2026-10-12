
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
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
import { announceOnBluesky } from '../utils/blueskyPost.server';
import { afterResponse } from '../utils/igdbData.server';
import { summarize } from '../utils/meta';
import { AddPage } from '../components/Page';

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

    // #160: and on Bluesky, from the IC account, after the response.
    const name = data.get('name');
    afterResponse(args.context, () =>
      announceOnBluesky({
        text: `New ${data.get('type')?.toLowerCase() === 'association' ? 'association' : 'studio'} on Community: ${name}${location.city ? ` (${location.city})` : ''}`,
        url: `${BASE_URL}${orgPath(org)}`,
        title: name,
        description:
          summarize(data.get('about')) ||
          "On Indie Collective's community database.",
      })
    );

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
    <AddPage
      title="Add a studio or association"
      description="Who they are, where they are, and where to find them. Anyone can improve it afterwards."
      next={[
        "Link their games, from each game's page.",
        'Add the events they organise.',
        "New entries are announced on the Indie Collective's channels.",
      ]}
    >
      <OrgForm
        method="post"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </AddPage>
  );
};

export default CreateOrg;
