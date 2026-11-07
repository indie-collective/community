

import { searchGames } from '../data/games.server';

// What the record pickers search (components/RecordPicker).
export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const excludedIds = searchParams.get('notId');
  const excludedIdsArray = excludedIds ? excludedIds.split(',') : [];

  try {
    return await searchGames(q, { excludeIds: excludedIdsArray });
  } catch (err) {
    console.error(err);
    return { error: 'Something went wrong' };
  }
}
