// The public API's description, OpenAPI 3.1 (#349): what /api documents and
// /api/v1/openapi.json serves.
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const page = (item) => ({
  type: 'object',
  properties: { data: { type: 'array', items: ref(item) }, next: { type: ['string', 'null'], description: 'The next page, or null' } },
});
const listParams = [
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
  { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'From the previous page’s `next`' },
];
const country = { name: 'country', in: 'query', schema: { type: 'string', pattern: '^[A-Za-z]{2}$' }, description: 'ISO 3166-1 alpha-2 code' };
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID or slug' };
const one = (name) => ({
  parameters: [idParam],
  responses: {
    200: { description: name, content: { 'application/json': { schema: { type: 'object', properties: { data: ref(name) } } } } },
    404: { description: 'Not found' },
  },
});
const link = { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, url: { type: 'string' } } };
const place = {
  type: ['object', 'null'],
  properties: {
    country_code: { type: ['string', 'null'] },
    region: { type: ['string', 'null'] },
    city: { type: ['string', 'null'] },
    latitude: { type: ['number', 'null'] },
    longitude: { type: ['number', 'null'] },
  },
};
const text = { type: ['string', 'null'] };
const time = { type: ['string', 'null'], format: 'date-time' };

export const openApi = (origin) => ({
  openapi: '3.1.0',
  info: {
    title: 'Indie Collective community API',
    version: '1.0.0',
    description:
      'Read-only: indie games, studios, associations and events. Data under the ODbL 1.0 (https://opendatacommons.org/licenses/odbl/1-0/): credit “Indie Collective community”.',
  },
  servers: [{ url: `${origin}/api/v1` }],
  paths: {
    '/games': {
      get: {
        summary: 'Games, newest first',
        parameters: [...listParams, { ...country, description: 'Made by an organisation in this country' }, { name: 'tag', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'A page of games', content: { 'application/json': { schema: page('Game') } } } },
      },
    },
    '/games/{id}': { get: { summary: 'A game, with its organisations, tags, events and timeline', ...one('Game') } },
    '/organizations': {
      get: {
        summary: 'Studios and associations, newest first',
        parameters: [...listParams, country, { name: 'city', in: 'query', schema: { type: 'string' } }, { name: 'type', in: 'query', schema: { enum: ['studio', 'association'] } }],
        responses: { 200: { description: 'A page of organisations', content: { 'application/json': { schema: page('Organization') } } } },
      },
    },
    '/organizations/{id}': { get: { summary: 'An organisation, with its games and hosted events', ...one('Organization') } },
    '/events': {
      get: {
        summary: 'Events: upcoming soonest first, or past latest first',
        parameters: [
          ...listParams,
          country,
          { name: 'organization', in: 'query', schema: { type: 'string' }, description: 'Hosted by this organisation (ID)' },
          { name: 'upcoming', in: 'query', schema: { type: 'boolean', default: true } },
        ],
        responses: { 200: { description: 'A page of events', content: { 'application/json': { schema: page('Event') } } } },
      },
    },
    '/events/{id}': { get: { summary: 'An event, with its hosts and games', ...one('Event') } },
  },
  components: {
    schemas: {
      Game: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: text,
          url: { type: 'string' },
          name: { type: 'string' },
          about: text,
          site: text,
          igdb_slug: text,
          image_urls: { type: 'array', items: { type: 'string' } },
          organizations: { type: 'array', items: { ...link, properties: { ...link.properties, role: { type: 'string' } } } },
          tags: { type: 'array', items: { type: 'string' } },
          events: { type: 'array', items: link },
          milestones: { type: 'array', items: { type: 'object' } },
          created_at: time,
          updated_at: time,
        },
      },
      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: text,
          url: { type: 'string' },
          type: { enum: ['studio', 'association'] },
          status: { enum: ['active', 'hiatus', 'closed'] },
          name: { type: 'string' },
          about: text,
          site: text,
          bsky_handle: text,
          place,
          logo_url: text,
          games: { type: 'array', items: link },
          events: { type: 'array', items: link },
          created_at: time,
          updated_at: time,
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: text,
          url: { type: 'string' },
          name: { type: 'string' },
          about: text,
          site: text,
          ticket_url: text,
          starts_at: time,
          ends_at: time,
          time_zone: { type: 'string' },
          status: { enum: ['ongoing', 'canceled'] },
          attendance: { enum: ['in_person', 'online', 'hybrid'] },
          online_url: text,
          place,
          cover_url: text,
          previous_edition_id: text,
          organizations: { type: 'array', items: link },
          games: { type: 'array', items: link },
          created_at: time,
          updated_at: time,
        },
      },
    },
  },
});
