import { Box, Heading, useToast } from '@chakra-ui/react';
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import Navigation from '../components/Navigation';
import EventForm from '../components/EventForm';

export async function action({ request }) {
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
    latitude: parseFloat(data.get('latitude')),
    longitude: parseFloat(data.get('longitude')),
  };

  try {
    const event = await db.event.create({
      data: {
        name: data.get('name'),
        status: data.get('canceled') ? 'canceled' : 'ongoing',
        starts_at: new Date(data.get('start')),
        ends_at: new Date(data.get('end')),
        about: data.get('about'),
        site: data.get('site'),
        // cover: {
        //   connect: {
        //     id: data.get('cover'),
        //   }
        // },
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
    const values = Object.fromEntries(data);
    return json({ error: err.message, values });
  }
}

export const meta = () => ({
  title: 'Create a new event',
});

const CreateEvent = () => {
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
        <Heading mb={5}>Create event</Heading>

        <EventForm
          method="POST"
          loading={transition.state === 'submitting'}
          defaultData={actionData?.values}
        />
      </Box>
    </div>
  );
};

export default CreateEvent;
