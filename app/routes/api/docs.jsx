import { Box, Code, Heading, Link as ChakraLink, List, Stack, Text } from '@chakra-ui/react';
import { useLoaderData } from 'react-router';

import { Page, PageHeader, PageSection } from '../../components/Page';
import { pageMeta } from '../../utils/meta';
import getOrigin from '../../utils/origin.server';

// The public API's documentation (#349).
export const loader = ({ request }) => ({ origin: getOrigin(request) });

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'API',
    description: 'A free, read-only JSON API of indie games, studios, associations and events, and widgets for your site.',
    path: location.pathname,
  });

const Example = ({ children }) => (
  <Box as="pre" p={3} borderRadius="md" bg={{ base: 'gray.100', _dark: 'gray.800' }} overflowX="auto" fontSize="sm">
    <code>{children}</code>
  </Box>
);

const ENDPOINTS = [
  ['/api/v1/games', 'Games, newest first. country (made there), tag.'],
  ['/api/v1/games/{id or slug}', 'A game, with its studios and roles, tags, events, images and timeline.'],
  ['/api/v1/organizations', 'Studios and associations, newest first. type (studio, association), country, city.'],
  ['/api/v1/organizations/{id or slug}', 'One, with its games and roles, and the events it hosts.'],
  ['/api/v1/events', 'Upcoming events soonest first; upcoming=false for past ones. country, organization (an ID).'],
  ['/api/v1/events/{id or slug}', 'An event, with its hosts and games.'],
];

const Api = () => {
  const { origin } = useLoaderData();
  return (
    <Page>
      <PageHeader
        title="API"
        description="The community's indie games, studios, associations and events as JSON, for your site or app. Free, no key, read-only."
      />
      <Stack gap={4} maxW="3xl" mb={{ base: 8, md: 10 }}>
        <Text>
          Every list is paged: up to <Code>limit</Code> items (50 by default, 100 at most), and{' '}
          <Code>next</Code>, the address of the next page, or null. Any site can call it from the browser (CORS).
          Answers are cached for five minutes. Deleted records and members are never returned.
        </Text>
        <Text>
          The data is under the{' '}
          <ChakraLink href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">
            ODbL 1.0
          </ChakraLink>
          : credit “Indie Collective community” with a link. For everything at once, see the{' '}
          <ChakraLink href="/data">open data exports</ChakraLink>. The full description is in{' '}
          <ChakraLink href="/api/v1/openapi.json">OpenAPI</ChakraLink>.
        </Text>
      </Stack>
      <PageSection title="Endpoints">
        <List.Root gap={2} ps={5} mb={6}>
          {ENDPOINTS.map(([path, about]) => (
            <List.Item key={path}>
              <Code>GET {path}</Code> {about}
            </List.Item>
          ))}
        </List.Root>
        <Heading as="h3" size="md" mb={2}>
          Example
        </Heading>
        <Example>{`fetch('${origin}/api/v1/events?country=FR&limit=10')
  .then((response) => response.json())
  .then(({ data, next }) => console.log(data.map((event) => event.name)));`}</Example>
      </PageSection>
      <PageSection title="Widgets">
        <Text mb={3}>
          Show an organisation&apos;s upcoming events or games on your site: copy the code from its page (“On your
          site”), or use these, with its ID or slug:
        </Text>
        <Example>{`<iframe src="${origin}/embed/org/{id or slug}/events" width="100%" height="400" style="border:0" title="Upcoming events"></iframe>
<iframe src="${origin}/embed/org/{id or slug}/games?theme=dark" width="100%" height="400" style="border:0" title="Games"></iframe>`}</Example>
      </PageSection>
    </Page>
  );
};

export default Api;
