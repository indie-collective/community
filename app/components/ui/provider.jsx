import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';

import { ColorModeProvider } from './color-mode';
import theme from '../../theme';

export function Provider(props) {
  return (
    <ChakraProvider value={theme}>
      <ThemeProvider disableTransitionOnChange attribute="class">
        <ColorModeProvider {...props} />
      </ThemeProvider>
    </ChakraProvider>
  );
}
