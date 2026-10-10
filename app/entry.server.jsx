import { CacheProvider } from '@emotion/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter } from 'react-router';

import createEmotionCache from './createEmotionCache';

export const streamTimeout = 5_000;

// Workers have no Node streams: render to a web ReadableStream.
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext
) {
  const userAgent = request.headers.get('user-agent');
  // Abort the rendering stream after the `streamTimeout` so it has time to
  // flush down the rejected boundaries.
  const controller = new AbortController();
  setTimeout(() => controller.abort(), streamTimeout + 1000);

  let shellRendered = false;
  const body = await renderToReadableStream(
    // A new emotion cache for this request.
    <CacheProvider value={createEmotionCache()}>
      <ServerRouter context={routerContext} url={request.url} />
    </CacheProvider>,
    {
      signal: controller.signal,
      onError(error) {
        responseStatusCode = 500;
        // Errors in the shell reject, and are logged by the router.
        if (shellRendered) console.error(error);
      },
    }
  );
  shellRendered = true;

  // Bots and SPA mode wait for all content to load before responding.
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
