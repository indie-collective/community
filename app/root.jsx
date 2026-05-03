import React, { useContext, useEffect } from 'react';
import { withEmotionCache } from '@emotion/react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useBreakpointValue,
  Progress,
  Presence,
} from '@chakra-ui/react';
import { LuTriangleAlert } from 'react-icons/lu';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
} from 'react-router';
import { ThemeProvider } from 'next-themes';

import theme from './theme';
import { useInjectStyles } from './emotion-client';
import { ClientStyleContext, ServerStyleContext } from './context';
// Vite resolves the file URL via the ?url suffix; passed to <Links />
// via the route's `links` export below.
import slickStyles from 'slick-carousel/slick/slick.css?url';
import isAuthenticated from './utils/isAuthenticated.server';
import { Provider as ChakraProvider } from './components/ui/provider';
import Error from './components/Error';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

export function links() {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
    },
    { rel: 'stylesheet', href: slickStyles },
  ];
}

export const meta = () => [
  {
    charSet: 'utf-8',
  },
  {
    title: 'Community',
  },
  {
    name: 'description',
    content: 'Video game related events around you and all over the world.',
  },
  {
    name: 'viewport',
    content: 'width=device-width,initial-scale=1',
  },
  {
    property: 'og:title',
    content: 'Community',
  },
  {
    property: 'og:description',
    content: 'Video game related events around you and all over the world.',
  },
  {
    name: 'twitter:site',
    content: '@IndieColle',
  },
  {
    name: 'twitter:title',
    content: 'Community',
  },
  {
    name: 'twitter:description',
    content: 'Video game related events around you and all over the world.',
  },
];

export const Layout = withEmotionCache((props, cache) => {
  const { children } = props;

  // client injection styles
  useInjectStyles(cache);

  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <meta
          name="emotion-insertion-point"
          content="emotion-insertion-point"
        />
      </head>
      <body
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <ChakraProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </ChakraProvider>
      </body>
    </html>
  );
});

export function ErrorBoundary({ error }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  return { currentUser };
};

export default function App() {
  let location = useLocation();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === 'loading' || navigation.state === 'submitting';

  return (
    <Layout>
      {/* <Presence present> */}
      <Flex direction="column">
        {isLoading && (
          <Progress.Root
            size="xs"
            indeterminate
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={9999}
            colorPalette="green"
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        )}
        <Flex
          as="main"
          flex="1"
          direction="column"
          alignItems="center"
          bg={{ base: 'gray.100', _dark: 'gray.900' }}
        >
          <Navigation />
          <Box minHeight="100vh" maxWidth={960} width="100%">
            <Outlet />
          </Box>
          <Footer />
        </Flex>
      </Flex>
      {/* </Presence> */}
    </Layout>
  );
}
