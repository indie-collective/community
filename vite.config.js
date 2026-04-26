import { vitePlugin as remix } from '@remix-run/dev';
import {
  createRoutesFromFolders,
} from '@remix-run/v1-route-convention';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ['**/.*'],
      // Preserve the existing v1 nested-folder route convention
      // (e.g. app/routes/event.$id/games.add.jsx). Without this adapter,
      // those folders would not resolve as nested children under the
      // default v2 flat route convention.
      routes(defineRoutes) {
        return createRoutesFromFolders(defineRoutes, {
          ignoredFilePatterns: ['.*'],
        });
      },
    }),
  ],
  ssr: {
    // @microsoft/clarity is ESM-only / not pre-bundled by Vite for SSR
    // by default, so force it through Vite's ssr transform.
    noExternal: ['@microsoft/clarity'],
  },
  server: {
    port: 3000,
  },
});
