import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    port: 3000,
  },
  ssr: {
    // These packages are CommonJS-only, or ship no "exports" field and rely on
    // directory imports. Node's native ESM loader rejects both. Remix v1's
    // compiler bundled everything, so this never came up; Vite externalises
    // server dependencies by default, so they must be bundled explicitly.
    noExternal: [/^@mui\//, 'react-use'],
  },
});
