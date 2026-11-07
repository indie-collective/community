import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';

// The frame for a proposal: rows of examples, each with what it is and
// where it's used.
export const Board = ({ title, children }) => (
  <Box p={8} bg="canvas" minW="920px">
    <Heading as="h1" fontSize="2xl" fontWeight="600" mb={6}>
      {title}
    </Heading>
    <Stack gap={5}>{children}</Stack>
  </Box>
);

export const Row = ({ label, where, children }) => (
  <HStack align="center" gap={6} borderTop="1px solid" borderColor="rule" pt={4}>
    <Box w="220px" flexShrink={0}>
      <Text fontWeight="semibold" fontSize="sm">
        {label}
      </Text>
      {where && (
        <Text fontSize="xs" color="muted">
          {where}
        </Text>
      )}
    </Box>
    <HStack gap={3} wrap="wrap" align="center">
      {children}
    </HStack>
  </HStack>
);
