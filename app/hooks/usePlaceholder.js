import placeholderLight from '../assets/placeholder.jpg';

import { useColorModeValue } from '../components/ui/color-mode';
import placeholderDark from '../assets/placeholder_dark.jpg';
import placeholderSquareLight from '../assets/placeholder-square.jpg';
import placeholderSquareDark from '../assets/placeholder-square_dark.jpg';

export default function usePlaceholder(format) {
  const square = useColorModeValue(
    placeholderSquareLight,
    placeholderSquareDark
  );
  const wide = useColorModeValue(placeholderLight, placeholderDark);
  return format === 'square' ? square : wide;
}
