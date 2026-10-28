// A member's notifications as a private Atom feed (#343), for feed readers:
// the same signed address as their calendar (utils/calendarToken).
import { listNotifications } from '../../data/notifications.server';
import { personFromCalendarToken } from '../../utils/calendarToken.server';
import { atomFeed } from '../../utils/feed';
import getOrigin from '../../utils/origin.server';

export async function loader({ request, params }) {
  const personId = await personFromCalendarToken(params.token);
  if (!personId) throw new Response('Not Found', { status: 404 });
  const origin = getOrigin(request);
  const notifications = await listNotifications(personId, { limit: 50 });
  const xml = atomFeed({
    title: 'My Indie Collective notifications',
    self: `${origin}/my-feed/${params.token}`,
    site: `${origin}/notifications`,
    entries: notifications.map((notification) => ({
      title: notification.message,
      // One entry per notification, though several lead to the same page.
      url: `${origin}${notification.path}`,
      id: `${origin}/notifications#${notification.id}`,
      summary: notification.message,
      published: notification.created_at,
    })),
  });
  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8', 'Cache-Control': 'private, max-age=900' },
  });
}
