import { Box, Button, Field, Input, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router';

import { PageHeader } from '../components/Page';
import PlaceField from '../components/PlaceField';
import { toaster } from '../components/ui/toaster';
import { getVenue, updateVenue } from '../data/venues.server';
import { actionErrorMessage } from '../utils/actionError.server';
import { authorizer, canWrite } from '../utils/auth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { routeRecordId } from '../utils/pageRecord.server';
import { venuePath } from '../utils/slug';
import { webUrl } from '../utils/url';

export const loader = async ({ request, params }) => {
  const id = await routeRecordId('venue', params.id);
  // Redirects to sign-in before anything is loaded.
  await isAuthenticated(request, true);
  const venue = await getVenue(id);
  if (!venue) throw new Response('Not Found', { status: 404 });
  return { venue };
};

export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('venue', params.id);
  const currentUser = await authorizer.authorize(args, { rules: [canWrite] });
  const data = await request.formData();
  try {
    const venue = await updateVenue(id, {
      name: data.get('name') || undefined,
      about: data.get('about'),
      site: webUrl(data.get('site')),
      location: {
        street: data.get('street'),
        city: data.get('city'),
        region: data.get('region'),
        country_code: data.get('country_code'),
        latitude: parseFloat(data.get('latitude')) || null,
        longitude: parseFloat(data.get('longitude')) || null,
      },
      authorId: currentUser.id,
    });
    return redirect(venuePath(venue));
  } catch (err) {
    return { error: await actionErrorMessage(err, 'Updating the venue failed') };
  }
}

export const meta = ({ data }) => [{ title: `Edit "${data?.venue?.name}" | Venues` }];

const EditVenue = () => {
  const { venue } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const l = venue.location;
  const [place, setPlace] = useState({
    label: l ? [l.street, l.city, l.region, l.country_code].filter(Boolean).join(', ') : '',
    value: l,
  });

  useEffect(() => {
    if (!actionData?.error) return;
    // Deferred: creating a toast while React commits triggers flushSync.
    queueMicrotask(() =>
      toaster.create({ title: 'Something went wrong', description: actionData.error, type: 'error' })
    );
  }, [actionData]);

  return (
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Edit venue" />
      <Box asChild display="flex" flexDirection="column" gap={5}>
        <Form method="post">
          <Field.Root required>
            <Field.Label htmlFor="name">
              Name
              <Field.RequiredIndicator />
            </Field.Label>
            <Input id="name" name="name" defaultValue={venue.name} />
          </Field.Root>
          <Field.Root>
            <Field.Label>Location</Field.Label>
            <PlaceField
              value={place}
              onChange={setPlace}
              onClear={() => setPlace({ label: '', value: null })}
            />
            <Field.HelperText>A new location also moves its upcoming events, not its past ones.</Field.HelperText>
          </Field.Root>
          <Field.Root>
            <Field.Label htmlFor="site">Website</Field.Label>
            <Input id="site" name="site" defaultValue={venue.site ?? ''} inputMode="url" />
          </Field.Root>
          <Field.Root>
            <Field.Label htmlFor="about">About</Field.Label>
            <Textarea id="about" name="about" rows={5} defaultValue={venue.about ?? ''} />
          </Field.Root>
          <Button type="submit" alignSelf="flex-start" loading={navigation.state === 'submitting'}>
            Submit
          </Button>
        </Form>
      </Box>
    </Box>
  );
};

export default EditVenue;
