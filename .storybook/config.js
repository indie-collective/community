import { configure, addDecorator } from '@storybook/react';
// import { withInfo } from '@storybook/addon-info';
// import '@storybook/addon-console';

const req = require.context('../client/components', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

// addDecorator(withInfo);

configure(loadStories, module);
