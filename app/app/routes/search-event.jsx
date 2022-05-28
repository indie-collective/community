import { json } from '@remix-run/node';

import { db } from '../utils/db.server';

export async function loader({ request }) {
  const url = new URL(request.url);
  const search = (url.searchParams.get('q') || '').split(' ').join(' | ');
  const excludedIds = url.searchParams.get('notId');
  const excludedIdsArray = excludedIds ? excludedIds.split(',') : [];

  const data = await db.event.findMany({
    where: {
      name: {
        search,
      },
      id: {
        notIn: excludedIdsArray,
      },
    },
    select: {
      id: true,
      name: true,
    },
    take: parseInt(url.searchParams.get('take')) || 10,
  });

  return json(data);
}
