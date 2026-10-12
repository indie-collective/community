import { Box, Flex, Text } from '@chakra-ui/react';

import Link from '../Link';

/**
 * A dense list in one panel (design pass): rows of something to recognise
 * on the left (a date, a dot, a logo), a title and a line under it, and
 * something on the right (a country, a count).
 */
export const RowList = ({ children, ...rest }) => (
  <Box
    as="ul"
    listStyleType="none"
    bg="surface"
    borderRadius="xl"
    shadow="xs"
    overflow="hidden"
    {...rest}
  >
    {children}
  </Box>
);

/** A row of a RowList, a link when `to` is given. */
export const Row = ({ to, start, title, sub, end }) => {
  const content = (
    <Flex align="center" gap={3} px={3} py={2} minW={0}>
      {start}
      <Box flex="1" minW={0}>
        <Text fontWeight="semibold" truncate>
          {title}
        </Text>
        {sub &&
          (typeof sub === 'string' ? (
            <Text fontSize="sm" color="muted" truncate>
              {sub}
            </Text>
          ) : (
            // Rich content (a search match): its own text elements.
            <Box fontSize="sm" color="muted">
              {sub}
            </Box>
          ))}
      </Box>
      {end}
    </Flex>
  );
  return (
    <Box
      as="li"
      borderTopWidth="1px"
      borderColor="border"
      _first={{ borderTopWidth: 0 }}
    >
      {to ? (
        <Box
          asChild
          display="block"
          transition="background-color 120ms"
          _hover={{ bg: 'bg.muted' }}
        >
          <Link to={to}>{content}</Link>
        </Box>
      ) : (
        content
      )}
    </Box>
  );
};
