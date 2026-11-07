import PickerCreate from './PickerCreate';

export default {
  title: 'Forms/PickerCreate',
  component: PickerCreate,
  args: {
    query: 'Pixel Moss',
    fetcher: { state: 'idle', data: [] },
    options: [
      { type: 'studio', label: (name) => `Add “${name}” as a studio` },
      { type: 'association', label: (name) => `Add “${name}” as an association` },
    ],
    onCreate: () => {},
  },
};

// When a picker's search found nothing: offer to add it.
export const NothingFound = {};
