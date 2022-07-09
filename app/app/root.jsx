import { withEmotionCache } from '@emotion/react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react';
import { AnimatePresence } from 'framer-motion';
import React, { useContext, useEffect } from 'react';

import { ServerStyleContext, ClientStyleContext } from './context';
import theme from './theme';
import { authenticator } from './utils/auth.server';
import slickStyles from 'slick-carousel/slick/slick.css'; // CSS needed for Carousel component
import Error from './components/Error';
import Navigation from './components/Navigation';

const Main = (props) => (
  <Box as="main" mx="auto" mb={{ base: 0, md: '3rem' }} {...props} />
);

export function links() {
  return [{ rel: 'stylesheet', href: slickStyles }];
}

export const meta = () => ({
  charset: 'utf-8',
  title: 'Community',
  description: 'Video game related events around you and all over the world.',
  viewport: 'width=device-width,initial-scale=1',
  'og:title': 'Community',
  'og:description':
    'Video game related events around you and all over the world.',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Community',
  'twitter:description':
    'Video game related events around you and all over the world.',
});

const Document = withEmotionCache(({ children }, emotionCache) => {
  const serverStyleData = useContext(ServerStyleContext);
  const clientStyleData = useContext(ClientStyleContext);

  // Only executed on client
  useEffect(() => {
    // re-link sheet container
    emotionCache.sheet.container = document.head;
    // re-inject tags
    const tags = emotionCache.sheet.tags;
    emotionCache.sheet.flush();
    tags.forEach((tag) => {
      emotionCache.sheet._insertTag(tag);
    });
    // reset cache to reapply global styles
    clientStyleData?.reset();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstaticom" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        {serverStyleData?.map(({ key, ids, css }) => (
          <style
            key={key}
            data-emotion={`${key} ${ids.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ))}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
});

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Main maxWidth="960px">
          <AnimatePresence exitBeforeEnter>
            <Error statusCode={caught.status} />
          </AnimatePresence>
        </Main>
      </ChakraProvider>
    </Document>
  );
}

export const loader = async ({request}) => {
  const currentUser = await authenticator.isAuthenticated(request);

  return { currentUser };
};

export default function App() {
  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Main maxWidth="960px">
          <AnimatePresence exitBeforeEnter>
            <Box>
              <Navigation />

              <Outlet />
            </Box>
          </AnimatePresence>
        </Main>
      </ChakraProvider>
    </Document>
  );
}
