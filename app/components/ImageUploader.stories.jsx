import ImageUploader from './ImageUploader';
import { member } from '../stories/fixtures';

const fetcher = { state: 'idle', data: null, submit: () => {} };

export default {
  title: 'Games/ImageUploader',
  component: ImageUploader,
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
  args: { gameId: 'g1', currentUser: member, fetcher },
};

export const Default = {};
export const Dark = { globals: { colorMode: 'dark' } };
