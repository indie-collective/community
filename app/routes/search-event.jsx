

import { searchEvents } from '../data/events.server';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const excludedIds = searchParams.get('notId');
  const excludedIdsArray = excludedIds ? excludedIds.split(',') : [];

  try {
    return await searchEvents(q, {
      excludeIds: excludedIdsArray,
      limit: parseInt(searchParams.get('take')) || 10,
    });
  } catch (err) {
    console.error(err);
    return { error: 'Something went wrong' };
  }
}
