import { ChakraProvider } from '@chakra-ui/react';

import { ColorModeProvider } from './color-mode';
import theme from '../../theme';

// ColorModeProvider is next-themes' ThemeProvider; wrapping it in a second
// one mounted two providers and two theme scripts.
export function Provider(props) {
  return (
    <ChakraProvider value={theme}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
