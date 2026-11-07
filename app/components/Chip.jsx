import { Box, Text } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';

/**
 * A tag, round, in sentence case. When it filters it's a toggle: give it
 * `pressed` (and render it as a button, or a link with `asChild`), and it's
 * sun yellow while on, like every other "on". `count` is a muted number
 * after the name. A filter already applied is on, with an × to take it off:
 * give it `onRemove` and `removeLabel`.
 */
const Chip = ({
  pressed,
  count,
  onRemove,
  removeLabel,
  size = 'md',
  children,
  ...rest
}) => {
  const small = size === 'sm';
  const toggle = pressed !== undefined;
  if (onRemove) pressed = true;
  return (
    <Box
      as={toggle ? 'button' : 'span'}
      type={toggle ? 'button' : undefined}
      aria-pressed={toggle ? Boolean(pressed) : undefined}
      display="inline-flex"
      alignItems="center"
      gap={1.5}
      px={small ? 2 : 2.5}
      h={small ? '22px' : '28px'}
      rounded="full"
      fontSize={small ? 'xs' : 'sm'}
      fontWeight="medium"
      whiteSpace="nowrap"
      borderWidth="1px"
      borderColor={pressed ? 'ink' : 'rule'}
      bg={pressed ? 'sun' : 'surface'}
      color={pressed ? 'onPop' : 'ink'}
      cursor={toggle || rest.asChild ? 'pointer' : undefined}
      transition="background-color 150ms ease-out, border-color 150ms ease-out"
      _hover={toggle || rest.asChild ? { borderColor: 'ink' } : undefined}
      {...rest}
    >
      {children}
      {count != null && (
        <Text as="span" color={pressed ? 'onPop' : 'muted'} fontWeight="400">
          {count.toLocaleString('en')}
        </Text>
      )}
      {onRemove && (
        <Box
          as="button"
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          display="grid"
          placeItems="center"
          me={-1}
          w="18px"
          h="18px"
          rounded="full"
          cursor="pointer"
          _hover={{ bg: 'rgba(16, 32, 29, 0.12)' }}
        >
          <LuX size={12} />
        </Box>
      )}
    </Box>
  );
};

export default Chip;
