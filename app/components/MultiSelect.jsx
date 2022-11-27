import React from 'react';
import matchSorter from 'match-sorter';
import { usePopper } from 'react-popper';
import { useCombobox, useMultipleSelection } from 'downshift';
import { useDeepCompareEffect } from 'react-use';
import Highlighter from 'react-highlight-words';
import cc from 'classcat';
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'mango', label: 'Mango' },
  { value: 'kiwi', label: 'Kiwi' },
];

function defaultOptionFilterFunc(items, inputValue) {
  return matchSorter(items, inputValue, { keys: ['value', 'label'] });
}

function defaultItemRenderer(selected) {
  return selected.label;
}

function CreateablePicker(props) {
  const {
    items,
    optionFilterFunc = defaultOptionFilterFunc,
    itemRenderer = defaultItemRenderer,
    placeholder,
    onCreateItem,
    selectedItems,
    ...downshiftProps
  } = props;

  const [isCreating, setIsCreating] = React.useState(false);
  const [inputItems, setInputItems] = React.useState(items);
  const disclosureRef = React.useRef(null);
  const popoverRef = React.useRef(null);
  const { styles, attributes, forceUpdate } = usePopper(
    disclosureRef.current,
    popoverRef.current,
    {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    }
  );

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    activeIndex,
  } = useMultipleSelection({
    ...downshiftProps,
    selectedItems,
    stateReducer: (_, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      switch (type) {
        case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
          return {
            ...changes,
            activeIndex: null,
          };
        default:
          return changes;
      }
    },
  });

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
    selectItem,
    setHighlightedIndex,
    inputValue,
  } = useCombobox({
    selectedItem: null,
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      const filteredItems = optionFilterFunc(items, inputValue || '');

      if (isCreating && filteredItems.length > 0) {
        setIsCreating(false);
      }

      setInputItems(filteredItems);
    },
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          if (!changes.inputValue.includes(',')) return changes;

          addSelectedItem({
            label: changes.inputValue.replace(',', ''),
            value: changes.inputValue.replace(',', ''),
          });

          return {
            ...changes,
            inputValue: '',
          };
        case useCombobox.stateChangeTypes.InputBlur:
          return {
            ...changes,
            highlightedIndex: state.highlightedIndex,
            inputValue: '',
          };
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            highlightedIndex: state.highlightedIndex,
            isOpen: true,
            inputValue: '',
          };
        default:
          return changes;
      }
    },
    onStateChange: ({ type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            if (selectedItemValues.includes(selectedItem.value)) {
              removeSelectedItem(selectedItem);
            } else {
              if (onCreateItem && isCreating) {
                onCreateItem(selectedItem);
                setIsCreating(false);
                setInputItems(items);
              } else {
                addSelectedItem(selectedItem);
              }
            }

            selectItem(null);
          }
          break;
        default:
          break;
      }
    },
  });

  React.useEffect(() => {
    if (
      inputItems.length === 0 &&
      activeIndex === -1 &&
      inputValue.length > 0
    ) {
      setIsCreating(true);
      // @ts-ignore
      setInputItems([{ label: `${inputValue}`, value: inputValue }]);
      setHighlightedIndex(0);
    }
  }, [inputItems, setIsCreating, setHighlightedIndex, inputValue, activeIndex]);

  useDeepCompareEffect(() => {
    setInputItems(items);
  }, [items]);

  React.useEffect(() => {
    if (selectedItems && forceUpdate) {
      forceUpdate();
    }
  }, [selectedItems, forceUpdate]);

  const selectedItemValues = selectedItems.map((item) => item.value);

  return (
    <div className="relative w-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/tailwindcss@1.8.8/dist/tailwind.min.css"
      />
      <div>
        <HStack spacing={2} my={2}>
          {selectedItems.map((selectedItem, index) => (
            <Tag
              key={selectedItem.label}
              variant="solid"
              {...getSelectedItemProps({ selectedItem, index })}
            >
              <TagLabel>{selectedItem.label}</TagLabel>
              <TagCloseButton
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItem);
                }}
              />
            </Tag>
          ))}
        </HStack>
        <InputGroup position="relative" {...getComboboxProps()}>
          <Input
            {...getInputProps(
              getDropdownProps({
                placeholder,
                onClick: isOpen ? () => {} : openMenu,
                onFocus: isOpen ? () => {} : openMenu,
                ref: disclosureRef,
              })
            )}
          />
          <InputRightElement>
            <Button
              size="sm"
              {...getToggleButtonProps()}
              aria-label={'toggle menu'}
            >
              &#8595;
            </Button>
          </InputRightElement>
        </InputGroup>
        <div
          style={styles.popper}
          {...attributes.popper}
          {...getMenuProps({ ref: popoverRef, className: ' w-full' })}
        >
          <VStack
            alignItems="stretch"
            background={useColorModeValue('gray.100', 'black')}
            minH={300}
          >
            {isOpen &&
              inputItems
                .filter((i) => !selectedItems.some((s) => s.value === i.value))
                .map((item, index) => (
                  <Button
                    variant="ghost"
                    colorScheme="gray"
                    textAlign="left"
                    rounded={false}
                    isActive={highlightedIndex === index}
                    {...getItemProps({ item, index })}
                  >
                    {isCreating ? (
                      <Text>
                        <span>Create</span>{' '}
                        <span className="font-medium bg-yellow-300 text-yellow-900">
                          {item.label}
                        </span>
                      </Text>
                    ) : (
                      <Flex>
                        {selectedItemValues.includes(item.value) && (
                          <span role="img" aria-label="Selected">
                            ✅
                          </span>
                        )}
                        <Highlighter
                          autoEscape
                          searchWords={[inputValue || '']}
                          textToHighlight={itemRenderer(item)}
                          highlightClassName="bg-yellow-300"
                        />
                      </Flex>
                    )}
                  </Button>
                ))}
          </VStack>
        </div>
      </div>
    </div>
  );
}

export default function Example() {
  const [pickerItems, setPickerItems] = React.useState(fruits);
  const [selectedItems, setSelectedItems] = React.useState([]);

  const handleCreateItem = (item) => {
    setPickerItems((curr) => [...curr, item]);
    setSelectedItems((curr) => [...curr, item]);
  };

  const handleSelectedItemsChange = (selectedItems) => {
    if (selectedItems) {
      setSelectedItems(selectedItems);
    }
  };

  return (
    <CreateablePicker
      placeholder="Type name of fruit"
      onCreateItem={handleCreateItem}
      items={pickerItems}
      selectedItems={selectedItems}
      onSelectedItemsChange={(changes) =>
        handleSelectedItemsChange(changes.selectedItems)
      }
    />
  );
}
