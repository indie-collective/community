import { redirect } from 'react-router';

import { findBySlugOrId } from '../data/slugs.server';
import { isUuid } from './slug';

const SEGMENTS = { game: 'game', organization: 'org', event: 'event' };

/**
 * The ID of the record a page's URL names (#209): its slug, an old slug, or
 * its UUID. Throws a 404 when there's none, and a permanent redirect to the
 * current slug when the URL used another (a UUID, permanently; an old slug,
 * temporarily), for the page itself; its child routes (edit, actions…) are left alone.
 */
export async function pageRecordId(kind, request, param) {
  const found = await findBySlugOrId(kind, param);
  if (!found) throw new Response('Not Found', { status: 404 });

  if (found.slug && found.slug !== param) {
    const url = new URL(request.url);
    const page = `/${SEGMENTS[kind]}/${param}`;
    // Data requests (.data) redirect to the page, as React Router expects.
    if (url.pathname === page || url.pathname === `${page}.data`) {
      // Permanent from a UUID, which never changes. Temporary from an old
      // slug: a name can come back, and browsers keep 301s forever.
      throw redirect(
        `/${SEGMENTS[kind]}/${found.slug}${url.search}`,
        isUuid(param) ? 301 : 302
      );
    }
  }
  return found.id;
}

/**
 * The ID of the record a child route's URL names (edit, history,
 * actions…): by UUID, slug or old slug, so links built from a slug page
 * work too. Throws a 404 when there's none.
 */
export async function routeRecordId(kind, param) {
  const found = await findBySlugOrId(kind, param);
  if (!found) throw new Response('Not Found', { status: 404 });
  return found.id;
}
