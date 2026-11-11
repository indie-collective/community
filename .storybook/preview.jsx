import { Outlet, createRoutesStub } from 'react-router';

import { Provider } from '../app/components/ui/provider';
import { Toaster } from '../app/components/ui/toaster';

// Stories render inside the app's Chakra system and colour-mode provider,
// under a stub data router so Link, Form, useSubmit and useFetcher work.
//
// Per story, `parameters.router` can set:
//   currentUser  what the root loader returns (Navigation, AvatarButton)
//   root         more of the root loader's data (features, unreadNotifications)
//   action       handler for form submissions to the story's route
//   loader       data for the story's own route
//   routes       extra routes (e.g. /check-username-availability)
//   path, url    for pages that read the URL: the story's route path
//                ('game/:id') and the address it opens on ('/game/g1')
const withRouter = (Story, { parameters }) => {
  const {
    currentUser = null,
    root = {},
    action,
    loader,
    routes = [],
    path,
    url = '/',
  } = parameters.router ?? {};
  const story = { Component: () => <Story />, action, loader };
  const Stub = createRoutesStub([
    {
      id: 'root',
      path: '/',
      loader: () => ({
        currentUser,
        origin: 'https://community.indieco.xyz',
        language: 'en',
        unreadNotifications: 0,
        features: {},
        ...root,
      }),
      Component: Outlet,
      children: [
        path ? { path, ...story } : { index: true, ...story },
        ...routes,
      ],
    },
  ]);
  return <Stub initialEntries={[url]} />;
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
  parameters: {
    layout: 'padded',
    // The design system first, its introduction on top: Storybook opens on it.
    options: {
      storySort: {
        order: [
          'Theme',
          ['Introduction', 'Colors', 'Typography', 'Shadows', 'Radii', 'Motion'],
          '*',
        ],
      },
    },
  },
};

export default preview;
