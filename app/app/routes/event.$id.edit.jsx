import { Box, Heading, useToast } from '@chakra-ui/react';
import {
  json,
  redirect,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useActionData, useLoaderData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import Navigation from '../components/Navigation';
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
    event,
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
    },
  };

  return json(data);
};

export async function action({ request, params }) {
  const { id } = params;

  const data = await unstable_parseMultipartFormData(
    request,
    createUploadHandler(['cover'])
  );

  try {
    const event = await db.event.update({
      where: { id },
      data: {
        name: data.get('name'),
        status: data.get('status') || undefined,
        starts_at: new Date(data.get('start')),
        ends_at: new Date(data.get('end')),
        about: data.get('about'),
        site: data.get('site'),
        // cover: {
        //   connect: {
        //     id: data.get('cover'),
        //   }
        // },
        // location: {
        //   connectOrCreate: {
        //     where: {
        //       id: data.get('location'),
        //     },
        //     create: {

        //     },
        //   },
        // },
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

export const meta = ({ data }) => ({
  title: `Edit "${data.event.name}" | Events`,
});

const EditEvent = () => {
  const { event } = useLoaderData();
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
        <Heading mb={5}>Update event</Heading>

        <EventForm
          method="POST"
          loading={transition.state === 'submitting'}
          defaultData={actionData?.values || event}
        />
      </Box>
    </div>
  );
};

export default EditEvent;
