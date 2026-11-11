import MotionGallery from './MotionGallery';
import placeholder from '../assets/placeholder.jpg';
import { member } from '../stories/fixtures';

// The strip shows each in its own shape: wide, tall, square.
const images = [
  { id: 'i1', url: placeholder, thumbnail_url: placeholder, width: 1920, height: 1080, alt: 'The harbour at night' },
  { id: 'i2', url: placeholder, thumbnail_url: placeholder, width: 1080, height: 1920, alt: 'The lighthouse' },
  { id: 'i3', url: placeholder, thumbnail_url: placeholder, width: 1400, height: 1400, alt: 'The map' },
  { id: 'i4', url: placeholder, thumbnail_url: placeholder, width: 2560, height: 1080, alt: 'The coast' },
  { id: 'i5', url: placeholder, thumbnail_url: placeholder, alt: '', external: true },
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
