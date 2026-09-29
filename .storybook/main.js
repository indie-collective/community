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
    plugins: config.plugins
      .flat()
      .filter((p) => !(p && p.name && p.name.startsWith('react-router'))),
  }),
};

export default config;
