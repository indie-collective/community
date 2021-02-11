import { useColorModeValue } from "@chakra-ui/react";

import placeholderLight from '../public/placeholder.jpg';
import placeholderDark from '../public/placeholder_dark.jpg';
import placeholderSquareLight from '../public/placeholder-square.jpg';
import placeholderSquareDark from '../public/placeholder-square_dark.jpg';

export default function usePlaceholder(format) {
  if (format === 'square') return '/' + useColorModeValue(placeholderSquareLight, placeholderSquareDark);
  return '/' + useColorModeValue(placeholderLight, placeholderDark);
}