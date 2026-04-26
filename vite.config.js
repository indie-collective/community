import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

// Note: route configuration moved to ./react-router.config.ts and
// ./app/routes.ts (which uses @react-router/remix-routes-option-adapter
// + createRoutesFromFolders to preserve the legacy v1 nested-folder
// route layout).

export default defineConfig({
  plugins: [reactRouter()],
  ssr: {
    // @microsoft/clarity is ESM-only / not pre-bundled by Vite for SSR
    // by default, so force it through Vite's ssr transform.
    noExternal: ['@microsoft/clarity'],
  },
  server: {
    port: 3000,
  },
});
