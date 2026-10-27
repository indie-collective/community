// Event calendars to subscribe to (#342): all events, a country's, an
// organisation's, and a member's own (private, signed address); and one
// event, for "Add to calendar".
import countryNames from '../../assets/countries.json';
import { getCalendarEvent, getOrganizationName, listCalendarEvents } from '../../data/feeds.server';
import { personFromCalendarToken } from '../../utils/calendarToken.server';
import { calendar, calendarResponse } from '../../utils/ical';
import getOrigin from '../../utils/origin.server';
import { routeRecordId } from '../../utils/pageRecord.server';
import { eventPath } from '../../utils/slug';

const notFound = () => new Response('Not Found', { status: 404 });

export async function loader({ request, params }) {
  const origin = getOrigin(request);
  const options = { origin, path: eventPath };
  const { pathname } = new URL(request.url);

  if (pathname === '/calendar.ics') {
    return calendarResponse(calendar('Indie Collective events', await listCalendarEvents(), options));
  }
  if (params.code) {
    const countryCode = params.code.toUpperCase();
    if (!countryNames[countryCode]) throw notFound();
    const events = await listCalendarEvents({ countryCode });
    return calendarResponse(calendar(`Indie events in ${countryNames[countryCode]}`, events, options));
  }
  if (pathname.startsWith('/org/')) {
    const organizationId = await routeRecordId('organization', params.id);
    const name = await getOrganizationName(organizationId);
    if (!name) throw notFound();
    const events = await listCalendarEvents({ organizationId });
    return calendarResponse(calendar(`${name}: events`, events, options));
  }
  if (pathname.startsWith('/event/')) {
    const event = await getCalendarEvent(await routeRecordId('event', params.id));
    if (!event) throw notFound();
    return calendarResponse(calendar(event.name, [event], options), {
      filename: `${event.slug || event.id}.ics`,
    });
  }
  if (params.token) {
    const attendeeId = await personFromCalendarToken(params.token);
    if (!attendeeId) throw notFound();
    const events = await listCalendarEvents({ attendeeId });
    // Private: not kept by shared caches.
    return calendarResponse(calendar('My Indie Collective events', events, options), {
      cache: 'private, max-age=900',
    });
  }
  throw notFound();
}
