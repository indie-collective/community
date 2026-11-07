import ThumbnailFields from './ThumbnailFields';

export default {
  title: 'Forms/ThumbnailFields',
  component: ThumbnailFields,
  // Hidden fields that carry a picture's thumbnail with the form: nothing
  // shows until a file is chosen.
  args: { name: 'logo', file: null },
};

export const Empty = {};
