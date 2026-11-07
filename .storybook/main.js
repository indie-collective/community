import { readFileSync } from 'node:fs';

// Page stories import route modules, and routes import their loaders' data
// (`*.server.js`: the database, the session). None of that can run in a
// browser, and stories give the loader's data themselves, so each server
// module becomes a stand-in with the same export names that does nothing.
const STUB = '\0server-stub:';
const stubServerModules = {
  name: 'stub-server-modules',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (!/\.server(\.[jt]sx?)?$/.test(source)) return null;
    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    });
    return resolved && STUB + resolved.id;
  },
  load(id) {
    if (!id.startsWith(STUB)) return null;
    const code = readFileSync(id.slice(STUB.length), 'utf8');
    const names = new Set(
      [
        ...code.matchAll(
          /export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g
        ),
      ].map(([, name]) => name)
    );
    // `export { a, b as c }`, and `export let { a, b } = …`.
    for (const [, list] of code.matchAll(
      /export\s*(?:(?:const|let|var)\s*)?\{([^}]*)\}/g
    )) {
      for (const part of list.split(',')) {
        const name = part.split(/\s+as\s+/).pop().trim();
        if (name && name !== 'default') names.add(name);
      }
    }
    const noop = 'async () => { throw new Error("Server code in a story"); }';
    return [
      ...[...names].map((name) => `export const ${name} = ${noop};`),
      `export default ${noop};`,
    ].join('\n');
  },
};

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../app/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  // The app's vite.config.js runs React Router's plugin, which expects to own
  // the whole build (routes, server entry). Stories only need plain React.
  viteFinal: (config) => ({
    ...config,
    plugins: [
      stubServerModules,
      ...config.plugins
        .flat()
        .filter((p) => !(p && p.name && p.name.startsWith('react-router'))),
    ],
  }),
};

export default config;
