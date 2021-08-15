import React, { forwardRef } from 'react';
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  useMergeRefs,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export const PasswordInput = forwardRef((props, ref) => {
  const { isOpen, onToggle } = useDisclosure();
  const inputRef = React.useRef(null);

  const mergeRef = useMergeRefs(inputRef, ref);

  const onClickReveal = () => {
    onToggle();
    const input = inputRef.current;
    if (input) {
      input.focus({ preventScroll: true });
      const length = input.value.length * 2;
      requestAnimationFrame(() => {
        input.setSelectionRange(length, length);
      });
    }
  };

  return (
    <InputGroup>
      <InputRightElement>
        <IconButton
          bg="transparent !important"
          variant="ghost"
          aria-label={isOpen ? 'Mask password' : 'Reveal password'}
          icon={isOpen ? <ViewIcon /> : <ViewOffIcon />}
          onClick={onClickReveal}
        />
      </InputRightElement>
      <Input
        ref={mergeRef}
        name="password"
        autoComplete="current-password"
        required
        {...props}
        type={isOpen ? 'text' : 'password'}
      />
    </InputGroup>
  );
});

PasswordInput.displayName = 'PasswordInput';
