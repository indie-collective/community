import { Text } from '@chakra-ui/react';

import SwipeableEdgeDrawer from './SwipeableEdgeDrawer';

export default {
  title: 'Map/SwipeableEdgeDrawer',
  component: SwipeableEdgeDrawer,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
  decorators: [(Story) => <div style={{ height: 600, position: 'relative' }}><Story /></div>],
};

// The atlas's list on a phone: a drawer that's pulled up from the bottom.
export const Default = {
  args: {
    header: <Text fontWeight="semibold">17 in view</Text>,
    children: <Text p={4}>{"The list of what's on the map"}</Text>,
    isOpen: false,
    onClose: () => {},
  },
};

export const Open = { args: { ...Default.args, isOpen: true } };
