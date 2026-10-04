import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import path from 'node:path';
import { defineConfig } from 'vite';

// Spike: build the app for Cloudflare Workers to measure it.
export default defineConfig(() => ({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    reactRouter(),
    {
      name: 'spike-stub-db',
      enforce: 'pre',
      resolveId(source, importer) {
        if (/(^|\/)db\.server(\.js)?$/.test(source) && importer && !importer.includes('/spike/'))
          return path.resolve('spike/db-stub.js');
        if (/^(jimp|aws-sdk|discord\.js|remix-auth-discord|igdb-api-node|memory-cache|pg-tsquery)$/.test(source))
          return path.resolve('spike/lib-stub.js');
      },
    },
  ],
}));
