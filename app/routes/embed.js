// Widgets for other sites (#349): an organisation's upcoming events or its
// games, as a small page made to sit in an <iframe>. Plain HTML, no script,
// light or dark (?theme=dark), linking back to the site.
import { getApiOrganization, listApiEvents, listOrganizationGamesForWidget } from '../data/api.server';
import getOrigin from '../utils/origin.server';
import { requireFeature } from '../data/featureFlags.server';
import isAuthenticated from '../utils/isAuthenticated.server';

const escape = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const date = (iso, timeZone) =>
  new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: timeZone || 'UTC' });

const page = ({ title, theme, body, org }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
  :root { color-scheme: ${theme === 'dark' ? 'dark' : 'light'}; --fg: ${theme === 'dark' ? '#f4f4f5' : '#18181b'}; --muted: ${theme === 'dark' ? '#a1a1aa' : '#52525b'}; --bg: ${theme === 'dark' ? '#18181b' : '#ffffff'}; --line: ${theme === 'dark' ? '#3f3f46' : '#e4e4e7'}; --accent: #16a34a; }
  body { margin: 0; padding: 12px; font: 15px/1.4 system-ui, sans-serif; color: var(--fg); background: var(--bg); }
  h1 { font-size: 16px; margin: 0 0 8px; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { padding: 8px 0; border-bottom: 1px solid var(--line); display: flex; gap: 10px; align-items: center; }
  a { color: inherit; text-decoration: none; } a:hover { text-decoration: underline; }
  img { width: 64px; height: 36px; object-fit: cover; border-radius: 4px; flex: none; background: var(--line); }
  .when, .empty, footer { color: var(--muted); font-size: 13px; }
  footer { margin-top: 10px; } footer a { color: var(--accent); }
</style>
</head>
<body>
${body}
<footer>Listed on <a href="${escape(org.url)}" target="_blank" rel="noopener">Indie Collective</a></footer>
</body>
</html>`;

export async function loader({ request, params }) {
  // Behind the "api" flag (/admin/flags), with the API.
  await requireFeature('api', await isAuthenticated(request));
  const origin = getOrigin(request);
  const theme = new URL(request.url).searchParams.get('theme') === 'dark' ? 'dark' : 'light';
  const org = await getApiOrganization(params.id, { origin });
  if (!org || !['events', 'games'].includes(params.widget)) throw new Response('Not Found', { status: 404 });

  let body;
  if (params.widget === 'events') {
    const { data } = await listApiEvents({ origin, organization: org.id, upcoming: true, limit: 10 });
    body = `<h1>Upcoming events: ${escape(org.name)}</h1>${
      data.length === 0
        ? '<p class="empty">No upcoming events.</p>'
        : `<ul>${data
            .map(
              (event) =>
                `<li><div><a href="${escape(event.url)}" target="_blank" rel="noopener">${escape(event.name)}</a><div class="when">${escape(
                  date(event.starts_at, event.time_zone)
                )}${event.place?.city ? ` · ${escape(event.place.city)}` : event.attendance === 'online' ? ' · Online' : ''}${
                  event.status === 'canceled' ? ' · Canceled' : ''
                }</div></div></li>`
            )
            .join('')}</ul>`
    }`;
  } else {
    const games = await listOrganizationGamesForWidget(org.id, { origin });
    body = `<h1>Games: ${escape(org.name)}</h1>${
      games.length === 0
        ? '<p class="empty">No games yet.</p>'
        : `<ul>${games
            .map(
              (game) =>
                `<li>${game.image_url ? `<img src="${escape(game.image_url)}" alt="">` : '<img alt="">'}<a href="${escape(game.url)}" target="_blank" rel="noopener">${escape(game.name)}</a></li>`
            )
            .join('')}</ul>`
    }`;
  }
  return new Response(page({ title: `${org.name}: ${params.widget}`, theme, body, org }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      // Made to be framed by other sites.
      'Content-Security-Policy': "default-src 'none'; img-src * data:; style-src 'unsafe-inline'; frame-ancestors *",
    },
  });
}
