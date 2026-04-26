import { remixRoutesOptionAdapter } from '@react-router/remix-routes-option-adapter';
import { createRoutesFromFolders } from '@remix-run/v1-route-convention';

// Preserve the existing v1 nested-folder route convention
// (e.g. app/routes/event.$id/games.add.jsx). The remix-routes-option
// adapter takes a Remix-style `routes(defineRoutes)` callback and
// returns a React Router v7 RouteConfig.
export default remixRoutesOptionAdapter((defineRoutes) =>
  createRoutesFromFolders(defineRoutes, {
    ignoredFilePatterns: ['.*'],
  }),
);
