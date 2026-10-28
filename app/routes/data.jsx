import { Box, Button, Code, Heading, Link as ChakraLink, List, Stack, Table, Text } from '@chakra-ui/react';
import { Form, useLoaderData, useNavigation } from 'react-router';

import { Page, PageHeader, PageSection } from '../components/Page';
import { listExports, publishExport } from '../data/openData.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { pageMeta } from '../utils/meta';
import { FILES, LICENCE } from '../utils/openData';
import getOrigin from '../utils/origin.server';

// Open data (#304): the weekly exports, their licence and their fields.
export const loader = async ({ request }) => {
  const [currentUser, exports] = await Promise.all([isAuthenticated(request), listExports()]);
  return { exports, isAdmin: Boolean(currentUser?.isAdmin) };
};

export const action = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
  return publishExport({ origin: getOrigin(request) });
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Open data',
    description:
      "Download the community's indie games, studios, associations and events, as CSV and JSON, under the ODbL.",
    path: location.pathname,
  });

const size = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

const OpenData = () => {
  const { exports, isAdmin } = useLoaderData();
  const navigation = useNavigation();
  const latest = exports.some((file) => file.name.endsWith('.zip'));
  return (
    <Page>
      <PageHeader
        title="Open data"
        description="The community's indie games, studios, associations and events, free to reuse. Updated every week."
      />

      <Stack gap={3} mb={{ base: 8, md: 10 }} maxW="2xl">
        {latest ? (
          <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
            <Button asChild colorPalette="green">
              <a href="/data/latest.zip">Download CSV (zip)</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/data/latest.json">Download JSON</a>
            </Button>
          </Stack>
        ) : (
          <Text color="muted">The first export is on its way: it&apos;s made every Monday.</Text>
        )}
        <Text>
          Under the{' '}
          <ChakraLink href={LICENCE.url} target="_blank" rel="noopener noreferrer">
            {LICENCE.name}
          </ChakraLink>
          : use it, change it and share it, crediting “{LICENCE.attribution}”, and share what you build from the
          database under the same licence. Images and descriptions belong to their authors; images are linked, not
          included.
        </Text>
        <Text color="muted" fontSize="sm">
          Not included: members, their emails and accounts, the change history, and deleted records. What you add to
          the site is shared under this licence.
        </Text>
        {isAdmin && (
          <Form method="post">
            <Button type="submit" size="sm" variant="outline" loading={navigation.state !== 'idle'}>
              Make an export now
            </Button>
          </Form>
        )}
      </Stack>

      {exports.length > 0 && (
        <PageSection title="Every export">
          <List.Root ps={5}>
            {exports.map((file) => (
              <List.Item key={file.name}>
                <ChakraLink href={`/data/${file.name}`}>{file.name}</ChakraLink>{' '}
                <Text as="span" color="muted" fontSize="sm">
                  ({size(file.size)})
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </PageSection>
      )}

      <PageSection title="What's in it">
        <Text mb={4}>
          The zip holds a CSV file per table, linked by IDs, and <Code>community.json</Code> with the same records
          nested: games with their organisations, tags, events and milestones; events with their hosts and games.
        </Text>
        <Stack gap={8}>
          {FILES.map(([file, description, columns]) => (
            <Box key={file}>
              <Heading as="h3" size="md" mb={1}>
                <Code>{file}</Code>
              </Heading>
              <Text color="muted" mb={2}>
                {description}
              </Text>
              <Table.Root size="sm" variant="outline">
                <Table.Body>
                  {columns.map(([name, about]) => (
                    <Table.Row key={name}>
                      <Table.Cell width="12rem">
                        <Code>{name}</Code>
                      </Table.Cell>
                      <Table.Cell>{about}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          ))}
        </Stack>
      </PageSection>
    </Page>
  );
};

export default OpenData;
