import { Box } from '@chakra-ui/react';
import { redirect, useActionData, useLoaderData, useNavigation } from 'react-router';
import { actionErrorMessage } from '../utils/actionError.server';
import { useEffect } from 'react';

import {
  getOrganizationForEdit,
  updateOrganization,
} from '../data/organizations.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import OrgForm from '../components/OrgForm';
import { checkBlueskyHandle } from '../utils/bluesky.server';
import { ORGANIZATION_STATUSES } from '../db/schema.js';
import { orgPath } from '../utils/slug';
import { routeRecordId } from '../utils/pageRecord.server';
import { PageHeader } from '../components/Page';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const id = await routeRecordId('organization', params.id);

  // Redirects to sign-in before anything is loaded.
  await isAuthenticated(request, true);

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const org = await getOrganizationForEdit(id);

  if (!org)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = { org };

  return data;
};

export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('organization', params.id);

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

  // Checked before the update, so the form shows why it failed (#161).
  let bsky_handle;
  try {
    bsky_handle = await checkBlueskyHandle(data.get('bsky_handle'));
  } catch (err) {
    return { error: await actionErrorMessage(err), values: Object.fromEntries(data) };
  }

  try {
    const [, igdb_slug] =
      (data.get('igdb_url') || '').match(/companies\/(.+)/) || [];

    const org = await updateOrganization(id, {
      name: data.get('name'),
      type: data.get('type').toLowerCase(),
      // #39; anything else keeps the current one (or the default).
      status: ORGANIZATION_STATUSES.includes(data.get('status')) ? data.get('status') : undefined,
      site: data.get('site'),
      bskyHandle: bsky_handle,
      about: data.get('about'),
      location,
      logoId: data.get('logo'),
      authorId: currentUser.id,
    });

    return redirect(orgPath(org));
  } catch (err) {
    console.log(err);

    const values = Object.fromEntries(data);
    return { error: await actionErrorMessage(err, 'Updating the organization failed'), values };
  }
}

export const meta = ({
  data
}) => [{
  title: `Edit "${data.org.name}" | Organizations`
}];

const EditOrg = () => {
  const { org } = useLoaderData();
    const navigation = useNavigation();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    // Deferred: creating a toast while React commits triggers flushSync.
    queueMicrotask(() =>
      toaster.create({
        title: 'Something went wrong',
        description: actionData?.error,
        type: 'error',
        position: 'bottom-right',
      })
    );
  }, [actionData?.error, navigation.state === 'submitting']);

  return (
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Edit studio or association" />

      <OrgForm
        method="post"
        loading={navigation.state === 'submitting'}
        defaultData={org}
      />
    </Box>
  );
};

export default EditOrg;
