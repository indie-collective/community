// The public read-only API, v1 (#349): /api/v1/games, /organizations and
// /events, and each by ID or slug. JSON, open to any site (CORS), cached for
// five minutes. See /api for the documentation, /api/v1/openapi.json for
// its description.
import {
  MAX_LIMIT,
  getApiEvent,
  getApiGame,
  getApiOrganization,
  listApiEvents,
  listApiGames,
  listApiOrganizations,
} from '../../data/api.server';
import { ORGANIZATION_TYPES } from '../../db/schema.js';
import getOrigin from '../../utils/origin.server';

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300',
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });
const error = (status, message) => json({ error: message }, status);

const ONE = { games: getApiGame, organizations: getApiOrganization, events: getApiEvent };

export async function loader({ request, params }) {
  const url = new URL(request.url);
  const origin = getOrigin(request);
  const q = (name) => url.searchParams.get(name)?.trim() || null;
  const { collection, id } = params;
  if (!ONE[collection]) return error(404, `No such collection: ${collection}. Try games, organizations or events.`);

  if (id) {
    const record = await ONE[collection](id, { origin });
    return record ? json({ data: record }) : error(404, 'Not found.');
  }

  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(q('limit')) || 50));
  const country = q('country')?.toUpperCase() ?? null;
  if (country && !/^[A-Z]{2}$/.test(country)) return error(400, 'country is an ISO 3166-1 alpha-2 code, like FR.');
  const cursor = q('cursor');
  let page;
  if (collection === 'games') {
    page = await listApiGames({ origin, country, tag: q('tag'), limit, cursor });
  } else if (collection === 'organizations') {
    const type = q('type');
    if (type && !ORGANIZATION_TYPES.includes(type)) return error(400, `type is one of ${ORGANIZATION_TYPES.join(', ')}.`);
    page = await listApiOrganizations({ origin, type, country, city: q('city'), limit, cursor });
  } else {
    const upcoming = q('upcoming') !== 'false';
    page = await listApiEvents({ origin, country, organization: q('organization'), upcoming, limit, cursor });
  }
  const next = page.next && new URL(url);
  if (next) next.searchParams.set('cursor', page.next);
  return json({ data: page.data, next: next ? `${origin}${next.pathname}${next.search}` : null });
}

// Preflight for sites that send headers.
export const action = ({ request }) =>
  request.method === 'OPTIONS'
    ? new Response(null, { status: 204, headers: { ...HEADERS, 'Access-Control-Allow-Methods': 'GET, OPTIONS' } })
    : error(405, 'The API is read-only.');
