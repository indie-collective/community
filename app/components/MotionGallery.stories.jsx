import MotionGallery from './MotionGallery';
import placeholder from '../assets/placeholder.jpg';
import { member } from '../stories/fixtures';

const images = [
  { id: 'i1', url: placeholder, thumbnail_url: placeholder, alt: 'The harbour at night' },
  { id: 'i2', url: placeholder, thumbnail_url: placeholder, alt: 'The lighthouse' },
  { id: 'i3', url: placeholder, thumbnail_url: placeholder, alt: '', external: true },
];
const fetcher = { state: 'idle', data: null, submit: () => {} };

export default {
  title: 'Games/MotionGallery',
  component: MotionGallery,
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
  args: { gameId: 'g1', gameName: 'Salt and Lanterns', images, fetcher },
};

export const Visitor = {};

// Members can describe and remove pictures.
export const Member = { args: { currentUser: member } };
