import placeholderLight from '../assets/placeholder.jpg';

import { useColorModeValue } from "../components/ui/color-mode";
import placeholderDark from '../assets/placeholder_dark.jpg';
import placeholderSquareLight from '../assets/placeholder-square.jpg';
import placeholderSquareDark from '../assets/placeholder-square_dark.jpg';

export default function usePlaceholder(format) {
  if (format === 'square') return useColorModeValue(placeholderSquareLight, placeholderSquareDark);
  return useColorModeValue(placeholderLight, placeholderDark);
}