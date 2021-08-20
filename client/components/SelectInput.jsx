import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Box,
  Button,
  Text,
  InputGroup,
  InputRightElement,
  ResponsiveValue,
  BoxProps,
  InputProps,
  ButtonProps,
  TextProps,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  itemPredicate: PropTypes.func,
  icon: PropTypes.node,
  onSelect: PropTypes.func,
  value: PropTypes.object,
  //   placeholder: string;
  //   BoxProps?: BoxProps;
  //   InputProps?: InputProps;
  //   ButtonProps?: ButtonProps;
  //   TextProps?: TextProps;
  //   iconColor?: ResponsiveValue<CSS.Property.BackgroundImage>;
  //   iconHoverColor?: ResponsiveValue<CSS.Property.BackgroundImage>;
  //   boxHoverColor?: ResponsiveValue<CSS.Property.BackgroundImage>;
  //   initialValue?: DataProps;
};

const defaultProps = {
  items: [],
  itemPredicate: (item) => item,
  icon: null,
  onSelect: () => {},
};

const SelectInput = ({
  placeholder,
  items,
  itemPredicate,
  icon,
  inputProps,
  onSelect,
  onInputChange,
  BoxProps,
  ButtonProps,
  TextProps,
  iconColor,
  iconHoverColor,
  value,
}) => {
  const [focusedInput, setFocusedInput] = useState(false);
  const [focusedButton, setFocusedButton] = useState(false);
  const [selected, setSelected] = useState(value);
  const [input, setInput] = useState(value ? itemPredicate(value) : '');

  useEffect(() => setSelected(value), [value]);

  const dropdownBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box position="relative">
      <InputGroup
        onFocus={() => setFocusedInput(true)}
        onBlur={() => {
          setTimeout(() => {
            setFocusedInput(false);
          }, 150);
        }}
      >
        <Input
          {...inputProps}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
            onInputChange(e.target.value);
            setSelected(null);
          }}
          value={selected ? itemPredicate(selected) : input}
        />
        <InputRightElement
          children={
            selected ? (
              <CloseIcon
                boxSize="25px"
                color={iconColor}
                borderRadius="0.5em"
                padding="4px"
                cursor="pointer"
                _hover={{ backgroundColor: iconHoverColor }}
                onClick={() => {
                  setInput('');
                  setSelected(null);
                  if (onSelect) onSelect(undefined);
                }}
              />
            ) : (
              icon
            )
          }
        />
      </InputGroup>
      {focusedInput || focusedButton ? (
        <Box
          backgroundColor={dropdownBg}
          {...BoxProps}
          position="absolute"
          width="100%"
          maxHeight="200px"
          overflowY="auto"
          marginTop="6px"
          shadow="base"
          rounded="4px"
          zIndex="dropdown"
          onFocus={() => setFocusedButton(true)}
          onBlur={() => setFocusedButton(false)}
          _focus={{ outline: 'None' }}
        >
          {items.map((item) => (
            <Button
              key={itemPredicate(item)}
              {...ButtonProps}
              variant="ghost"
              colorScheme="gray"
              width="100%"
              textAlign="left"
              onClick={() => {
                setInput(itemPredicate(item));
                setSelected(item);
                setFocusedButton(false);
                setFocusedInput(false);
                if (onSelect) onSelect(item);
              }}
              rounded={false}
            >
              <Text
                fontWeight="normal"
                {...TextProps}
                paddingLeft="10px"
                width="100%"
                isTruncated
              >
                {itemPredicate(item)}
              </Text>
            </Button>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

SelectInput.propTypes = propTypes;
SelectInput.defaultProps = defaultProps;

export default SelectInput;
