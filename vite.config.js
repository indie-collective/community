import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

// The app runs on Cloudflare Workers (ADR 0002), in workerd in development
// too. D1_PERSIST_PATH points it at another local D1 and R2 (as the
// end-to-end tests do), e.g. `.wrangler/e2e/v3`.
const persistState = process.env.D1_PERSIST_PATH
  ? { path: process.env.D1_PERSIST_PATH.replace(/\/v3\/?$/, '') }
  : true;

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' }, persistState }),
    reactRouter(),
  ],
  server: {
    port: 3000,
  },
});
