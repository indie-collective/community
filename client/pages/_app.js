import App from 'next/app';
import { AnimatePresence } from 'framer-motion';
import {
  Box,
  ColorModeProvider,
  CSSReset,
  ThemeProvider,
} from '@chakra-ui/core';

import fetch from 'node-fetch';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

const isProduction = process && process.env.NODE_ENV === 'production';

const graphqlUrl = isProduction
  ? 'https://community.indieco.xyz/graphql'
  : 'http://localhost:4000/graphql';

const client = new ApolloClient({
  uri: graphqlUrl,
  fetch,
});

const Main = props => <Box as="main" mx="auto" mb="3rem" {...props} />;

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ApolloProvider client={client}>
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
      </ApolloProvider>
    );
  }
}
