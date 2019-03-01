import React from 'react';
import { useQuery } from 'urql';
import { SelectMenu, Button } from 'evergreen-ui';

import structuresQuery from '../../gql/structuresNames';

const StructureSelect = ({ children, selected, onChange }) => {
  const [structures] = useQuery({ query: structuresQuery });

  if (structures.fetching || !structures.data) {
    return <p>Loading...</p>;
  }

  let label = '';
  if (selected.length > 0) {
    label = selected.slice(0, 2).map(s => structures.data.allStructures.find(({id}) => s === id).name).join(', ');

    if (selected.length > 2) {
      label += ` and ${selected.length - 2} more...`;
    }
  }

  return (
    <SelectMenu
      isMultiSelect
      title="Select multiple names"
      options={structures.data.allStructures.map(({ id, name }) => ({
        label: name,
        value: id,
      }))}
      selected={selected}
      onSelect={item => {
        onChange([...selected, item.value]);
      }}
      onDeselect={item => {
        const deselectedItemIndex = selected.findIndex((value) => value === item.value);
        const selectedItems = selected.filter(
          (_item, i) => i !== deselectedItemIndex
        );
        onChange(selectedItems);
      }}
    >
      <Button>
        {label || 'Select multiple...'}
      </Button>
    </SelectMenu>
  );
};

export default StructureSelect;
