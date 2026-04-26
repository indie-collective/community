const {
  createRoutesFromFolders,
} = require('@remix-run/v1-route-convention');

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverDependenciesToBundle: ['@microsoft/clarity'],
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  // Preserve the v1 nested-folder route convention while opting into
  // v2_routeConvention. Without this adapter, folders such as
  // app/routes/event.$id/games.add.jsx would not resolve as nested children.
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes, {
      ignoredFilePatterns: ['.*'],
    });
  },
};
