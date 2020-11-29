import { useColorModeValue } from "@chakra-ui/react";

import placeholderLight from '../public/placeholder.jpg';
import placeholderDark from '../public/placeholder_dark.jpg';

export default function usePlaceholder() {
  return '/' + useColorModeValue(placeholderLight, placeholderDark);
}