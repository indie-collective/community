import App from 'next/app';
import { AnimatePresence } from 'framer-motion';
import {
  Box,
  ColorModeProvider,
  CSSReset,
  ThemeProvider,
} from '@chakra-ui/core';

const Main = props => <Box as="main" mx="auto" mb="3rem" {...props} />;

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider>
        <ColorModeProvider value="light">
          <CSSReset />
          <Main maxWidth="1280px">
            <AnimatePresence exitBeforeEnter>
              <Component {...pageProps} />
            </AnimatePresence>
          </Main>
        </ColorModeProvider>
      </ThemeProvider>
    );
  }
}
