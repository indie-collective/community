import { useColorMode } from "../components/ui/color-mode";

import placeholderLight from '../assets/placeholder.jpg';
import placeholderDark from '../assets/placeholder_dark.jpg';
import placeholderSquareLight from '../assets/placeholder-square.jpg';
import placeholderSquareDark from '../assets/placeholder-square_dark.jpg';

export default function usePlaceholder(format) {
  const { colorMode } = useColorMode();

  if (format === 'square') return colorMode === 'light' ? placeholderSquareLight : placeholderSquareDark;
  return colorMode === 'light' ? placeholderLight : placeholderDark;
}