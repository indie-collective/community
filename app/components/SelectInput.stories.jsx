import SelectInput from './SelectInput';

export default {
  title: 'Forms/SelectInput',
  component: SelectInput,
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  args: {
    placeholder: 'Search for a place',
    items: [{ label: 'Nantes, France' }, { label: 'Nancy, France' }],
    itemPredicate: (item) => item.label,
  },
};

export const Default = {};
