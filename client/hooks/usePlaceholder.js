import { useColorMode } from "@chakra-ui/core";

import placeholderLight from '../public/placeholder.jpg';
import placeholderDark from '../public/placeholder_dark.jpg';

export default function usePlaceholder() {
  const {colorMode} = useColorMode();

  if (colorMode === 'dark') {
    return '/' + placeholderDark;
  }

  return '/' + placeholderLight;
}