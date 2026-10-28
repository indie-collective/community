// The Worker (ADR 0002): React Router renders every page; the Cron Trigger
// refreshes the stalest stored IGDB data, for games nobody visits (#254),
// and reminds followers of events coming up (#343).
import { createRequestHandler } from 'react-router';

import { requestScope } from '../app/utils/background.server.js';
import { withEdgeCache } from './edgeCache.js';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
);

export default {
  fetch(request, env, ctx) {
    // In the request's scope, so data modules can work after the response.
    const handle = (req) =>
      requestScope.run({ ctx }, () => requestHandler(req, { cloudflare: { env, ctx } }));
    // Signed-out pages, cached for a minute (edgeCache.js). Not under
    // `vite dev`, where an edit must show at once; EDGE_CACHE=off turns it
    // off in a build (the end-to-end tests).
    const cache =
      import.meta.env.DEV || env.EDGE_CACHE === 'off'
        ? undefined
        : globalThis.caches?.default;
    return withEdgeCache(request, ctx, handle, cache);
  },

  async scheduled(controller, env, ctx) {
    const { refreshStalestIGDBData } = await import(
      '../app/utils/igdbRefresh.server.js'
    );
    ctx.waitUntil(refreshStalestIGDBData());
    // #343: events starting in a week, or tomorrow.
    const { sendEventReminders } = await import('../app/data/notifications.server.js');
    ctx.waitUntil(sendEventReminders(new Date(controller.scheduledTime)));
  },
};
