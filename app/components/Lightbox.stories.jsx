import { expect, within } from 'storybook/test';

import Lightbox from './Lightbox';
import placeholder from '../assets/placeholder.jpg';

export default {
  title: 'Games/Lightbox',
  component: Lightbox,
  parameters: { layout: 'fullscreen' },
  args: {
    images: [
      { id: 'i1', url: placeholder, alt: 'The harbour at night' },
      { id: 'i2', url: placeholder, alt: 'The lighthouse' },
    ],
    index: 0,
    onClose: () => {},
  },
};

// #350: a dialog; focus goes into it.
export const Default = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByAltText('The harbour at night')).toBeInTheDocument();
  },
};
