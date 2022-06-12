import { json } from '@remix-run/node';

import { db } from '../utils/db.server';

export async function loader({ request }) {
  const url = new URL(request.url);
  const search = (url.searchParams.get('q') || '')
    .trim() // remove leading and trailing whitespaces
    .split(' ') // split by whitespaces
    .map((t) => `'${t}'`) // wrap each term in quotes (due to special characters)
    .join(' | '); // join by OR  const excludedIds = url.searchParams.get('notId');
  const excludedIdsArray = excludedIds ? excludedIds.split(',') : [];

  try {
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
  } catch (err) {
    console.error(err);
    return json({ error: 'Something went wrong' });
  }
}
