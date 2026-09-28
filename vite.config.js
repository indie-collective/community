import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  plugins: [reactRouter()],
  server: {
    port: 3000,
  },
  ssr: {
    // These packages are CommonJS-only, or ship no "exports" field and rely on
    // directory imports. Node's native ESM loader rejects both in the built
    // server, where they would stay bare imports. Remix v1's compiler bundled
    // everything, so this never came up; Vite externalises server
    // dependencies by default, so the build must bundle them explicitly.
    //
    // MUI is bundled for the build only: in dev, Vite resolves externals to
    // real file paths itself, and evaluating MUI from source instead fails on
    // its `require` calls. react-use and react-dropzone are bundled in both:
    // their ESM builds work from source, while their CommonJS entries can't
    // provide named exports (`usePrevious`, `useDropzone`).
    noExternal:
      command === 'build'
        ? [/^@mui\//, 'react-use', 'react-dropzone']
        : ['react-use', 'react-dropzone'],
  },
}));
