import { Outlet, createRoutesStub } from 'react-router';

import { Provider } from '../app/components/ui/provider';
import { Toaster } from '../app/components/ui/toaster';

// Stories render inside the app's Chakra system and colour-mode provider,
// under a stub data router so Link, Form, useSubmit and useFetcher work.
//
// Per story, `parameters.router` can set:
//   currentUser  what the root loader returns (Navigation, AvatarButton)
//   action       handler for form submissions to the story's route
//   loader       data for the story's own route
//   routes       extra routes (e.g. /check-username-availability)
const withRouter = (Story, { parameters }) => {
  const { currentUser = null, action, loader, routes = [] } =
    parameters.router ?? {};
  const Stub = createRoutesStub([
    {
      id: 'root',
      path: '/',
      loader: () => ({ currentUser }),
      Component: Outlet,
      children: [
        { index: true, Component: () => <Story />, action, loader },
        ...routes,
      ],
    },
  ]);
  return <Stub initialEntries={['/']} />;
};

const withTheme = (Story, { globals }) => (
  <Provider forcedTheme={globals.colorMode}>
    <Story />
    <Toaster />
  </Provider>
);

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  decorators: [withRouter, withTheme],
  globalTypes: {
    colorMode: {
      description: 'Colour mode',
      toolbar: {
        title: 'Colour mode',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { colorMode: 'light' },
  parameters: { layout: 'padded' },
};

export default preview;
