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

import theme from './theme';
import { useInjectStyles } from './emotion-client';
import { ClientStyleContext, ServerStyleContext } from './context';
// Vite resolves the file URL via the ?url suffix; passed to <Links />
// via the route's `links` export below.
import slickStyles from 'slick-carousel/slick/slick.css?url';
import isAuthenticated from './utils/isAuthenticated.server';
import getOrigin from './utils/origin.server';
import { Provider as ChakraProvider } from './components/ui/provider';
import Error from './components/Error';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { Toaster } from './components/ui/toaster';

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
    // next-themes sets the colour-mode class and style on <html> before React
    // hydrates, so the server's attributes are expected to differ.
    <html lang="en" suppressHydrationWarning>
      <head>
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
          <Toaster />
          <ScrollRestoration />
          <Scripts />
        </ChakraProvider>
      </body>
    </html>
  );
});

// Navigation, page column and footer, shared by the app and its error pages so
// an error keeps the site around it.
function AppShell({ children }) {
  return (
    <Flex
      as="main"
      flex="1"
      direction="column"
      alignItems="center"
      bg={{ base: 'gray.100', _dark: 'gray.900' }}
    >
      <Navigation />
      <Box minHeight="100vh" maxWidth={960} width="100%">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}

export function ErrorBoundary({ error }) {
  if (isRouteErrorResponse(error)) {
    return (
      <AppShell>
        <Error statusCode={error.status} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minHeight="200px"
        px={4}
      >
        <LuTriangleAlert size="40px" />
        <Heading mt={4} mb={1} size="md">
          Something went wrong!
        </Heading>
        {import.meta.env.DEV && error instanceof globalThis.Error && (
          <>
            <Text maxWidth="sm">{error.message}</Text>
            <Box
              as="pre"
              mt={4}
              maxWidth="100%"
              overflowX="auto"
              fontSize="xs"
              textAlign="left"
            >
              {error.stack}
            </Box>
          </>
        )}
      </Flex>
    </AppShell>
  );
}

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  return { currentUser, origin: getOrigin(request) };
};

export default function App() {
  let location = useLocation();
  const navigation = useNavigation();

  const isLoading =
    navigation.state === 'loading' || navigation.state === 'submitting';

  // Layout wraps this already: React Router renders the exported Layout
  // around App and ErrorBoundary alike.
  return (
    <Flex direction="column">
      {isLoading && (
        <Progress.Root
          size="xs"
          // v3 has no `indeterminate` prop (it leaked to the DOM); a null
          // value is how v3 shows an indeterminate bar.
          value={null}
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
      <AppShell>
        <Outlet />
      </AppShell>
    </Flex>
  );
}
