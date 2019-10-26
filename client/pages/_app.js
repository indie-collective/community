import App from "next/app";
import {
  Box,
  ColorModeProvider,
  CSSReset,
  ThemeProvider
} from "@chakra-ui/core";

import fetch from 'node-fetch';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from "@apollo/react-hooks";

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
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
              <Component {...pageProps} />
            </Main>
          </ColorModeProvider>
        </ThemeProvider>
      </ApolloProvider>
    );
  }
}
