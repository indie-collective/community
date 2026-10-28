import { Box } from '@chakra-ui/react';
import { redirect, useActionData, useNavigation } from 'react-router';
import { actionErrorMessage } from '../utils/actionError.server';
import { addSource } from '../data/sources.server';
import { useEffect } from 'react';

import { createEvent } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { notifyDiscord } from '../utils/discordNotification.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import EventForm from '../components/EventForm';
import { zonedInputToDate } from '../utils/eventTime';
import { timeZoneAt } from '../utils/timeZone.server';
import { isTimeZone, parseAttendance } from '../utils/eventAttendance';
import getOrigin from '../utils/origin.server';
import { webUrl } from '../utils/url';
import { eventPath } from '../utils/slug';
import { PageHeader } from '../components/Page';

export async function action(args) {
  const { request } = args;

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await parseFormWithUploads(request, ['cover']);

  const location = {
    street: data.get('street'),
    city: data.get('city'),
    region: data.get('region'),
    country_code: data.get('country_code'),
    latitude: parseFloat(data.get('latitude')) || null,
    longitude: parseFloat(data.get('longitude')) || null,
  };
  const attendance = parseAttendance(data.get('attendance'));
  // Times are entered as wall-clock time where the event happens (#204);
  // online, in the zone chosen on the form (#347).
  const timeZone =
    attendance === 'online' && isTimeZone(data.get('time_zone'))
      ? data.get('time_zone')
      : timeZoneAt(location.latitude, location.longitude);

  try {
    const event = await createEvent({
      name: data.get('name'),
      status: data.get('canceled') ? 'canceled' : 'ongoing',
      timeZone,
      startsAt: zonedInputToDate(data.get('start'), timeZone),
      endsAt: zonedInputToDate(data.get('end'), timeZone),
      about: data.get('about'),
      site: webUrl(data.get('site')),
      ticketUrl: webUrl(data.get('ticket_url')),
      attendance,
      onlineUrl: webUrl(data.get('online_url')),
      previousEditionId: data.get('previous_edition_id') || null,
      coverId: data.get('cover'),
      location,
      authorId: currentUser.id,
    });

    // #338: where it came from, to read again and fill in.

    if (data.get('source_url')) await addSource('event', event.id, data.get('source_url'));


    const BASE_URL = getOrigin(request);

    await notifyDiscord(
      `${currentUser.username} added event "${data.get(
        'name'
      )}" at ${new Date().toISOString()} - ${BASE_URL}${eventPath(event)}`
    );

    return redirect(eventPath(event));
  } catch (err) {
    const values = Object.fromEntries(data);
    return { error: await actionErrorMessage(err), values };
  }
}

export const loader = async ({ request }) => {
  return await isAuthenticated(request, true);
};

export const meta = () => [
  {
    title: 'Create a new event',
  },
];

const CreateEvent = () => {
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
      })
    );
  }, [actionData?.error, navigation.state === 'submitting']);

  return (
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Add an event" />

      <EventForm
        method="POST"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values}
      />
    </Box>
  );
};

export default CreateEvent;
