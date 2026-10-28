import { Alert, Badge, Box, Button, HStack, Input, Link as ChakraLink, Table, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { Form, useActionData, useLoaderData, useNavigation } from 'react-router';

import Link from '../../components/Link';
import { PageHeader } from '../../components/Page';
import { listRecentSources, refreshSources } from '../../data/sources.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { eventPath, gamePath, orgPath } from '../../utils/slug';

// Outside sources (#338): what was read lately, what it filled in, and what
// failed. The hourly Cron Trigger does it; this runs it now.

const PATHS = { game: gamePath, organization: orgPath, event: eventPath };

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  return { sources: await listRecentSources() };
};

export const action = async ({ request }) => {
  await requireAdmin(request);
  // One record's ("organization:<id>"), or the stalest.
  const [kind, id] = ((await request.formData()).get('record') ?? '').split(':');
  return refreshSources(
    ['game', 'organization', 'event'].includes(kind) && id ? { only: { kind, id } } : { limit: 20 }
  );
};

export const meta = () => [{ title: 'Sources - Community Administration' }];

const Sources = () => {
  const { sources } = useLoaderData();
  const result = useActionData();
  const navigation = useNavigation();
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader
        eyebrow="Admin"
        title="Outside sources"
        description="Records' websites, Steam, itch.io and Bluesky pages, read every week to fill in empty descriptions, websites, Bluesky handles and ticket links. Never what people entered."
      />
      {result && (
        <Alert.Root status="info" mb={4} data-testid="sources-result">
          <Alert.Indicator />
          <Alert.Title>
            Linked {result.linked}, read {result.read}, filled in {result.filled}.
          </Alert.Title>
        </Alert.Root>
      )}
      <Form method="post">
        <HStack mb={4} gap={2} wrap="wrap">
          <Button type="submit" size="sm" loading={navigation.state !== 'idle'}>
            Read the stalest now
          </Button>
          <Input name="record" size="sm" width="22rem" placeholder="Or one record: game:<id>, organization:<id>…" aria-label="Record" />
        </HStack>
      </Form>
      <Table.ScrollArea>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Record</Table.ColumnHeader>
              <Table.ColumnHeader>Source</Table.ColumnHeader>
              <Table.ColumnHeader>Read</Table.ColumnHeader>
              <Table.ColumnHeader>Filled in</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sources.map((source) => (
              <Table.Row key={source.id} data-testid="source">
                <Table.Cell>
                  {source.record ? (
                    <ChakraLink asChild>
                      <Link to={PATHS[source.kind](source.record)}>{source.record.name}</Link>
                    </ChakraLink>
                  ) : (
                    <Text color="muted">Gone</Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge mr={2}>{source.source}</Badge>
                  <ChakraLink href={source.url} target="_blank" rel="noopener noreferrer" fontSize="sm">
                    {source.url.replace(/^https?:\/\//, '').slice(0, 60)}
                  </ChakraLink>
                </Table.Cell>
                <Table.Cell color={source.error ? 'fg.error' : 'muted'} fontSize="sm">
                  {source.error ?? (source.fetched_at ? formatDistanceToNow(new Date(source.fetched_at), { addSuffix: true }) : 'Not yet')}
                </Table.Cell>
                <Table.Cell fontSize="sm">{source.filled.join(', ') || '—'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
};

export default Sources;
