import js from '@eslint/js';
import { importX } from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  // Build output, test reports and tools' caches: not ours to lint.
  {
    ignores: [
      'dist',
      'build',
      'public/build',
      'storybook-static',
      'playwright-report',
      'test-results',
      '.react-router',
      '.wrangler',
    ],
  },
  importX.flatConfigs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: '19.2' },
      // Modules import each other without the extension: './Card'.
      'import-x/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off',
      // Props taken out so the rest can be passed on: `{ type, ...rest }`.
      'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
      // Copy has apostrophes in it ("it's"); only these break JSX.
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
      // The platform's own modules: the Worker's bindings, React Router's
      // build.
      'import-x/no-unresolved': [
        'error',
        { ignore: ['^cloudflare:', '^virtual:'] },
      ],
    },
  },
  // Code that runs on the server (the Worker, with Node's compatibility),
  // in Node (tests, scripts, tools' config) or in Playwright.
  {
    files: [
      '**/*.server.js',
      '**/*.test.js',
      '*.config.js',
      'app/db/node.js',
      'workers/**',
      'e2e/**',
      'scripts/**',
    ],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  // Playwright's fixtures call `use`, which isn't React's.
  { files: ['e2e/**'], rules: { 'react-hooks/rules-of-hooks': 'off' } },
];
