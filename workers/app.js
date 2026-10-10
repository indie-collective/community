// The Worker (ADR 0002): React Router renders every page; the Cron Trigger
// refreshes the stalest stored IGDB data, for games nobody visits (#254).
import { createRequestHandler } from 'react-router';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
);

export default {
  fetch(request, env, ctx) {
    return requestHandler(request, { cloudflare: { env, ctx } });
  },

  async scheduled(controller, env, ctx) {
    const { refreshStalestIGDBData } = await import(
      '../app/utils/igdbRefresh.server.js'
    );
    ctx.waitUntil(refreshStalestIGDBData());
  },
};
