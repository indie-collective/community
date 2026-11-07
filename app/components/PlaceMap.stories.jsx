import PlaceMap from './PlaceMap';
import { PLACES } from '../stories/fixtures';

export default {
  title: 'Map/PlaceMap',
  component: PlaceMap,
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
  args: {
    id: 's1',
    location: PLACES.nantes,
    color: 'brand',
    label: 'Pixel Moss',
    address: '2 rue de la Biscuiterie, Nantes',
  },
};

// Where a studio, an association, an event or a venue is, on its page.
export const Default = {};
