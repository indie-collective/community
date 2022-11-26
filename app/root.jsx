import { withEmotionCache } from '@emotion/react';
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import { AnimatePresence } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import posthog from 'posthog-js';

import { ServerStyleContext, ClientStyleContext } from './context';
import theme from './theme';
import { authenticator } from './utils/auth.server';
import slickStyles from 'slick-carousel/slick/slick.css'; // CSS needed for Carousel component
import Error from './components/Error';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

const Main = (props) => {
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  return (
    <Flex
      as="main"
      flex="1"
      direction="column"
      ml={variant === 'mobile' ? 0 : '260px'}
      {...props}
    />
  );
};

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
      <body
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
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
        <AnimatePresence exitBeforeEnter>
          <Main>
            <Error statusCode={caught.status} />
          </Main>
        </AnimatePresence>
      </ChakraProvider>
    </Document>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <Document>
      <ChakraProvider theme={theme}>
        <AnimatePresence exitBeforeEnter>
          <Main justifyContent="center">
            <Flex
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
            >
              <WarningIcon boxSize="40px" mr={0} />
              <Heading mt={4} mb={1} fontSize="lg">
                Something went wrong!
              </Heading>
              <Text maxWidth="sm">{error.message}</Text>
              <Text>{JSON.stringify(error.stack, false, 2)}</Text>
            </Flex>
          </Main>
        </AnimatePresence>
      </ChakraProvider>
    </Document>
  );
}

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request);
  const { POSTHOG_ID, NODE_ENV } = process.env;

  return { currentUser, ENV: { POSTHOG_ID, NODE_ENV } };
};

export default function App() {
  const {
    ENV: { POSTHOG_ID, NODE_ENV },
  } = useLoaderData();
  let location = useLocation();

  useEffect(() => {
    posthog.init(POSTHOG_ID, {
      api_host: 'https://eu.posthog.com',
      opt_in_site_apps: true,
      loaded(posthog) {
        if (NODE_ENV === 'development') posthog.opt_out_capturing();
      },
    });
    console.log('NODE_ENV', NODE_ENV, POSTHOG_ID);
  }, []);

  React.useEffect(() => {
    posthog.capture('$pageview');
  }, [location]);

  return (
    <Document>
      <ChakraProvider theme={theme}>
        <AnimatePresence exitBeforeEnter>
          <Flex direction="column">
            <Navigation />
            <Main>
              <Box minHeight="100vh">
                <Outlet />
              </Box>
              <Footer />
            </Main>
          </Flex>
        </AnimatePresence>
      </ChakraProvider>
    </Document>
  );
}
