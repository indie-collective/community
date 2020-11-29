import React from 'react';
import {
  ColorModeProvider,
  CSSReset,
  ThemeProvider,
} from '@chakra-ui/react';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
  (Story) => (
    <ThemeProvider>
      <ColorModeProvider>
        <CSSReset />
        <Story />
      </ColorModeProvider>
    </ThemeProvider>
  ),
];
