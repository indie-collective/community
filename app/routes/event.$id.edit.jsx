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
import EventForm from '../components/EventForm';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ params }) => {
  const { id } = params;

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
  });

  try {
    const data = await unstable_parseMultipartFormData(
      request,
      unstable_composeUploadHandlers(
        createUploadHandler(['cover']),
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

    const event = await db.event.update({
      where: { id },
      data: {
        name: data.get('name') || undefined,
        status: data.has('canceled')
          ? data.get('canceled')
            ? 'canceled'
            : 'ongoing'
          : undefined,
        starts_at: new Date(data.get('start')) || undefined,
        ends_at: new Date(data.get('end')) || undefined,
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
    return json({ error: 'Updating the event failed', values });
  }
}

export const meta = ({ data }) => ({
  title: `Edit "${data.event.name}" | Events`,
});

const EditEvent = () => {
  const { event } = useLoaderData();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

  }, [actionData?.error, transition.state === 'submitting']);

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Update event</Heading>

      <EventForm
        method="post"
        loading={transition.state === 'submitting'}
        defaultData={actionData?.values || event}
      />
    </Box>
  );
};

export default EditEvent;
