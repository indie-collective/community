import { Box, Heading } from '@chakra-ui/react';
import { redirect, useActionData, useLoaderData, useNavigation } from 'react-router';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import EventForm from '../components/EventForm';
import { zonedInputToDate } from '../utils/eventTime';
import { timeZoneAt } from '../utils/timeZone.server';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const { id } = params;

  // Redirects to sign-in before anything is loaded.
  await isAuthenticated(request, true);

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const event = await db.event.findUnique({
    where: { id },
    include: {
      cover: true,
      location: true,
    },
  });

  if (!event)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = {
    event: {
      ...event,
      cover: event.cover
        ? {
            url: `https://${process.env.CDN_HOST}/${event.cover.image_file.name}`,
            thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${event.cover.image_file.name}`,
          }
        : null,
    },
  };

  return data;
};

export async function action(args) {
  const { params, request } = args;
  const { id } = params;

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  try {
    const data = await parseFormWithUploads(request, ['cover']);

    const location = {
      street: data.get('street'),
      city: data.get('city'),
      region: data.get('region'),
      country_code: data.get('country_code'),
      latitude: parseFloat(data.get('latitude')) || null,
      longitude: parseFloat(data.get('longitude')) || null,
    };

    // Times are entered as wall-clock time where the event happens (#204):
    // a new location brings its zone, otherwise the event keeps its own.
    const timeZone =
      location.latitude !== null && location.longitude !== null
        ? timeZoneAt(location.latitude, location.longitude)
        : (await db.event.findUnique({ where: { id }, select: { time_zone: true } }))?.time_zone;

    const event = await db.event.update({
      where: { id },
      data: {
        name: data.get('name') || undefined,
        lastModifiedById: currentUser.id,
        status: data.has('canceled')
          ? data.get('canceled')
            ? 'canceled'
            : 'ongoing'
          : undefined,
        time_zone: timeZone,
        starts_at: zonedInputToDate(data.get('start'), timeZone) ?? undefined,
        ends_at: zonedInputToDate(data.get('end'), timeZone) ?? undefined,
        about: data.get('about') || undefined,
        site: data.get('site') || undefined,
        cover: data.get('cover')
          ? {
              connect: {
                id: data.get('cover'),
              },
            }
          : undefined,
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
      },
      select: {
        id: true,
      },
    });

    return redirect(`/event/${event.id}`);
  } catch (err) {
    console.log(err);

    const values = Object.fromEntries(data);
    return { error: 'Updating the event failed', values };
  }
}

export const meta = ({
  data
}) => [{
  title: `Edit "${data.event.name}" | Events`
}];

const EditEvent = () => {
  const { event } = useLoaderData();
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
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Update event</Heading>

      <EventForm
        method="post"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || event}
      />
    </Box>
  );
};

export default EditEvent;
