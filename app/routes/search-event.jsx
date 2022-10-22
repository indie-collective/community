import { json } from '@remix-run/node';

import { db } from '../utils/db.server';
import { getFullTextSearchQuery } from '../utils/search.server';

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const search = getFullTextSearchQuery(q);

  const excludedIds = searchParams.get('notId');
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
