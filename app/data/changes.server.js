// The change log (#151, part 2): what history pages and the admin pages
// read. The only place that knows how changes are stored.
import { db } from '../utils/db.server';

/**
 * The latest changes to games, organisations and events, newest first,
 * with their author's id, names and admin flag.
 */
export function listRecentChanges({ limit }) {
  return db.change.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      id: true,
      operation: true,
      created_at: true,
      table_name: true,
      record_id: true,
      data: true,
      author: {
        select: { id: true, first_name: true, last_name: true, isAdmin: true },
      },
    },
  });
}
