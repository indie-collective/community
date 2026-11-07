import { HStack, Text } from '@chakra-ui/react';

import AtlasMark from './AtlasMark';

export default {
  title: 'Map/AtlasMark',
  component: AtlasMark,
};

// Told apart by shape as well as colour.
export const All = {
  render: () => (
    <HStack gap={4}>
      {['studio', 'association', 'event'].map((type) => (
        <HStack key={type} gap={2}>
          <AtlasMark type={type} size={20} />
          <Text fontSize="sm">{type}</Text>
        </HStack>
      ))}
    </HStack>
  ),
};

export const Dark = { ...All, globals: { colorMode: 'dark' } };
