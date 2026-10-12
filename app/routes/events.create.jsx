
import { redirect, useActionData, useNavigation } from 'react-router';
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
import getOrigin from '../utils/origin.server';
import { webUrl } from '../utils/url';
import { eventPath } from '../utils/slug';
import { announceOnBluesky } from '../utils/blueskyPost.server';
import { afterResponse } from '../utils/igdbData.server';
import { summarize } from '../utils/meta';
import { AddPage } from '../components/Page';

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
  // Times are entered as wall-clock time where the event happens (#204).
  const timeZone = timeZoneAt(location.latitude, location.longitude);

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
      previousEditionId: data.get('previous_edition_id') || null,
      coverId: data.get('cover'),
      location,
      authorId: currentUser.id,
    });

    const BASE_URL = getOrigin(request);

    // #160: and on Bluesky, from the IC account, after the response.
    const name = data.get('name');
    afterResponse(args.context, () =>
      announceOnBluesky({
        text: `New event on Community: ${name}${location.city ? `, in ${location.city}` : ''}`,
        url: `${BASE_URL}${eventPath(event)}`,
        title: name,
        description:
          summarize(data.get('about')) ||
          "An event on Indie Collective's community database.",
      })
    );

    await notifyDiscord(
      `${currentUser.username} added event "${data.get(
        'name'
      )}" at ${new Date().toISOString()} - ${BASE_URL}${eventPath(event)}`
    );

    return redirect(eventPath(event));
  } catch (err) {
    const values = Object.fromEntries(data);
    return { error: err.message, values };
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
    <AddPage
      title="Add an event"
      description="When and where it happens, and where to find out more. Anyone can improve it afterwards."
      next={[
        "Add the games shown there, from the event's page.",
        'Add who organises it.',
        "New entries are announced on the Indie Collective's channels.",
      ]}
    >
      <EventForm
        method="POST"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values}
      />
    </AddPage>
  );
};

export default CreateEvent;
