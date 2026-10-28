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
import isAuthenticated from './utils/isAuthenticated.server';
import getOrigin from './utils/origin.server';
import { countUnread } from './data/notifications.server';
import { enabledFeatures } from './data/featureFlags.server';
import { languageOf } from './i18n/language';
import { useLanguage, useT } from './i18n';
import { Provider as ChakraProvider } from './components/ui/provider';
import Error from './components/Error';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { Toaster } from './components/ui/toaster';
import { pageMeta } from './utils/meta';

export function links() {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    // Poppins for titles (two weights), Inter for text (variable).
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Poppins:wght@600;700&display=swap',
    },
    // Feeds, for readers that find them from any page (#342).
    { rel: 'alternate', type: 'application/atom+xml', title: 'New on Indie Collective', href: '/feed.xml' },
    { rel: 'alternate', type: 'application/atom+xml', title: 'New games', href: '/games/feed.xml' },
    { rel: 'alternate', type: 'application/atom+xml', title: 'New events', href: '/events/feed.xml' },
    { rel: 'alternate', type: 'application/atom+xml', title: 'New studios and associations', href: '/orgs/feed.xml' },
  ];
}

// The charset and viewport tags are in Layout; routes return the full set.
export const meta = ({ matches, location }) =>
  pageMeta(matches, { title: 'Community', path: location.pathname });

export const Layout = withEmotionCache((props, cache) => {
  const { children } = props;

  // client injection styles
  useInjectStyles(cache);
  const language = useLanguage();

  return (
    // next-themes sets the colour-mode class and style on <html> before React
    // hydrates, so the server's attributes are expected to differ.
    <html lang={language} suppressHydrationWarning>
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

// "Skip to content", in the page's language (#344).
const SkipLabel = () => useT()('nav.skip');

// Navigation, page column and footer, shared by the app and its error pages so
// an error keeps the site around it.
// The header and footer sit outside <main>, so landmarks say what they are,
// and a skip link jumps past the header to the page.
function AppShell({ children }) {
  return (
    <Flex direction="column" alignItems="center" minHeight="100vh" bg="canvas">
      <Box
        as="a"
        href="#content"
        position="absolute"
        top={2}
        left={2}
        zIndex="skipLink"
        px={4}
        py={2}
        borderRadius="md"
        bg="surface"
        shadow="md"
        fontWeight="semibold"
        transform="translateY(-200%)"
        _focusVisible={{ transform: 'none' }}
      >
        <SkipLabel />
      </Box>
      <Navigation />
      <Box as="main" id="content" flex="1" maxWidth={960} width="100%">
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

  return {
    currentUser,
    origin: getOrigin(request),
    // #344: the interface's language.
    language: languageOf(request),
    // #343: the bell in the header.
    unreadNotifications: currentUser ? await countUnread(currentUser.id) : 0,
    // Feature flags on for them (/admin/flags).
    features: await enabledFeatures(currentUser),
  };
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
          // Only when loading takes a moment: a fast page shows no flash.
          animation="fade-in 200ms ease-out 250ms both"
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
