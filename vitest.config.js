import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Separate from vite.config.js on purpose: React Router's Vite plugin expects
// to build the whole app and has no place in unit or story tests.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['app/**/*.test.{js,jsx}'],
          environment: 'node',
        },
      },
      {
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // Desktop width: the navigation and heading scale switch at md.
            viewport: { width: 1280, height: 900 },
          },
        },
      },
    ],
  },
});
