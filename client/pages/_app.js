import App from 'next/app';
import { AnimatePresence } from 'framer-motion';
import {
  Box,
  ColorModeProvider,
  CSSReset,
  ThemeProvider,
} from '@chakra-ui/core';
import Head from 'next/head';
// CSS needed for Carousel component
import 'slick-carousel/slick/slick.css';

const Main = props => <Box as="main" mx="auto" mb="3rem" {...props} />;

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider>
        <ColorModeProvider>
          <CSSReset />
          <Head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
          </Head>
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
