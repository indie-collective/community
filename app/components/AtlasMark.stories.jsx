import { HStack, Text } from '@chakra-ui/react';

import AtlasMark, { LogoMark } from './AtlasMark';
import cover from '../stories/sample-cover.svg';

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

// With its logo: the picture in its kind's ring, its mark on the corner.
export const WithLogo = {
  render: () => (
    <HStack gap={6}>
      {['studio', 'association', 'event'].map((type) => (
        <HStack key={type} gap={2}>
          <LogoMark type={type} logo={{ thumbnail_url: cover }} size={28} />
          <Text fontSize="sm">{type}</Text>
        </HStack>
      ))}
    </HStack>
  ),
};

export const Dark = { ...All, globals: { colorMode: 'dark' } };
