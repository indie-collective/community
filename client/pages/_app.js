import App from 'next/app';
import { AnimatePresence } from 'framer-motion';
import {
  Box,
  ChakraProvider,
  cookieStorageManager,
  localStorageManager,
} from '@chakra-ui/react';
import { UserProvider } from '@auth0/nextjs-auth0';

import Head from 'next/head';

import theme from '../theme';

// CSS needed for Carousel component
import 'slick-carousel/slick/slick.css';

const Main = (props) => (
  <Box as="main" mx="auto" mb={{ base: 0, md: '3rem' }} {...props} />
);

export default class MyApp extends App {
  getServerSideProps({ req }) {
    return {
      props: {
        // first time users will not have any cookies and you may not return
        // undefined here, hence ?? is necessary
        cookies: req.headers.cookie ?? '',
      },
    };
  }

  render() {
    const { Component, pageProps } = this.props;

    const colorModeManager =
      typeof cookies === 'string'
        ? cookieStorageManager(pageProps.cookies)
        : localStorageManager;

    return (
      <UserProvider>
        <ChakraProvider theme={theme} colorModeManager={colorModeManager}>
          <Head>
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicon-16x16.png"
            />
            <link rel="manifest" href="/site.webmanifest" />
            <script>
              {`(function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:1834658,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
            </script>
          </Head>
          <Main maxWidth="1280px">
            <AnimatePresence exitBeforeEnter>
              <Component {...pageProps} />
            </AnimatePresence>
          </Main>
        </ChakraProvider>
      </UserProvider>
    );
  }
}
