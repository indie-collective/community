import {
  Alert,
  Badge,
  Box,
  Button,
  Field,
  HStack,
  Input,
  Link as ChakraLink,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useSearchParams } from 'react-router';

import Link from '../../components/Link';
import { PageHeader } from '../../components/Page';
import PersonLink from '../../components/PersonLink';
import { changeLogSize, listModerationChanges, undoAllSince, undoChange } from '../../data/changes.server';
import { setRole } from '../../data/people.server';
import isAuthenticated from '../../utils/isAuthenticated.server';

// Moderation (#309): every change, newest first, to undo one, or everything
// someone did since a time, and to restrict them.

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
  return currentUser;
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [found, size] = await Promise.all([
    listModerationChanges({ username: params.get('person') || null, page }),
    changeLogSize(),
  ]);
  return { ...found, page, size };
};

export const action = async ({ request }) => {
  const admin = await requireAdmin(request);
  const data = await request.formData();
  switch (data.get('intent')) {
    case 'undo': {
      const { status } = await undoChange(data.get('change'), {
        adminId: admin.id,
        force: data.get('force') === 'on',
      });
      return {
        undo: data.get('change'),
        message:
          status === 'undone'
            ? 'Undone.'
            : status === 'conflict'
              ? 'Someone changed this record since: check it, then undo anyway if it should be.'
              : "This change can't be undone: what was there before isn't known.",
        conflict: status === 'conflict',
      };
    }
    case 'undo-all': {
      // The admin's local time: the browser sends its offset from UTC.
      const offset = Number(data.get('tz_offset')) || 0;
      const since = new Date(new Date(`${data.get('since')}Z`).getTime() + offset * 60000);
      if (Number.isNaN(since.getTime())) return { message: 'Choose since when.' };
      const { undone, skipped } = await undoAllSince(data.get('person'), since, { adminId: admin.id });
      return { message: `Undid ${undone} ${undone === 1 ? 'change' : 'changes'}.`, skipped };
    }
    case 'restrict':
      await setRole(data.get('person'), 'restricted');
      return { message: 'Restricted: they can no longer change anything.' };
    default:
      throw new Response('Bad Request', { status: 400 });
  }
};

export const meta = () => [{ title: 'Moderation - Community Administration' }];

const OPERATIONS = {
  create: ['Added', 'green'],
  update: ['Changed', 'blue'],
  delete: ['Deleted', 'red'],
};

const kb = (bytes) => `${Math.round((bytes ?? 0) / 1024).toLocaleString('en')} KB`;

const Moderation = () => {
  const { changes, hasMore, person, page, size } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const pageLink = (n) => {
    const next = new URLSearchParams(params);
    next.set('page', n);
    return `?${next}`;
  };
  const busy = navigation.state !== 'idle';
  // Minutes from the admin's time to UTC, for "since" (known in the browser).
  const [offset, setOffset] = useState(0);
  useEffect(() => setOffset(new Date().getTimezoneOffset()), []);

  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader
        eyebrow="Admin"
        title={person ? `Changes by @${person.username}` : 'Moderation'}
        description="Every change to games, organisations and events, newest first. Undo one, or everything someone did since a time."
      />

      {/* #340: how much room the log takes, by format. */}
      <Text fontSize="sm" color="muted" mb={4} data-testid="log-size">
        {size.length === 0
          ? 'The log is empty.'
          : size
              .map(({ format, rows, bytes }) => `${rows.toLocaleString('en')} ${format === 2 ? 'compact' : 'full'} entries (${kb(bytes)})`)
              .join(' · ')}
      </Text>

      {actionData?.message && (
        <Alert.Root status={actionData.conflict ? 'warning' : 'info'} mb={4} data-testid="moderation-result">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{actionData.message}</Alert.Title>
            {actionData.skipped?.length > 0 && (
              <Alert.Description>
                Skipped, as someone else changed them since:{' '}
                {actionData.skipped.map((change, i) => (
                  <span key={change.id}>
                    {i > 0 && ', '}
                    {change.record ? (
                      <ChakraLink asChild>
                        <Link to={change.record.path}>{change.record.name}</Link>
                      </ChakraLink>
                    ) : (
                      change.record_id
                    )}
                  </span>
                ))}
              </Alert.Description>
            )}
          </Alert.Content>
        </Alert.Root>
      )}

      {person && (
        <Stack direction={{ base: 'column', md: 'row' }} gap={4} mb={6} align={{ md: 'flex-end' }}>
          <Form method="post">
            <input type="hidden" name="person" value={person.id} />
            <input type="hidden" name="tz_offset" value={offset} />
            <HStack align="flex-end">
              <Field.Root>
                <Field.Label htmlFor="since">Undo all their changes since</Field.Label>
                <Input id="since" name="since" type="datetime-local" required size="sm" />
              </Field.Root>
              <Button type="submit" name="intent" value="undo-all" size="sm" colorPalette="orange" loading={busy}>
                Undo all since
              </Button>
            </HStack>
          </Form>
          {person.role !== 'restricted' && person.role !== 'admin' && (
            <Form method="post">
              <input type="hidden" name="person" value={person.id} />
              <Button type="submit" name="intent" value="restrict" size="sm" colorPalette="red" variant="outline">
                Restrict @{person.username}
              </Button>
            </Form>
          )}
          <ChakraLink asChild fontSize="sm">
            <Link to="/admin/changes">Everyone&apos;s changes</Link>
          </ChakraLink>
        </Stack>
      )}

      <Table.ScrollArea>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>When</Table.ColumnHeader>
              <Table.ColumnHeader>Who</Table.ColumnHeader>
              <Table.ColumnHeader>What</Table.ColumnHeader>
              <Table.ColumnHeader />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {changes.map((change) => {
              const [verb, color] = OPERATIONS[change.operation];
              return (
                <Table.Row key={change.id} data-testid="change">
                  <Table.Cell whiteSpace="nowrap" color="muted">
                    <time dateTime={new Date(change.created_at).toISOString()}>
                      {formatDistanceToNow(new Date(change.created_at), { addSuffix: true })}
                    </time>
                  </Table.Cell>
                  <Table.Cell>
                    {change.author ? (
                      <HStack gap={2}>
                        <PersonLink username={change.author.username} />
                        {!person && (
                          <ChakraLink asChild fontSize="xs" color="muted">
                            <Link to={`?person=${encodeURIComponent(change.author.username)}`}>all theirs</Link>
                          </ChakraLink>
                        )}
                      </HStack>
                    ) : (
                      <Text color="muted">Unknown</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={2} wrap="wrap">
                      <Badge colorPalette={change.undo_of ? 'gray' : color}>{change.undo_of ? 'Undid' : verb}</Badge>
                      <Text as="span" color="muted">
                        {change.kind}
                      </Text>
                      {change.record ? (
                        <ChakraLink asChild>
                          <Link to={change.record.path}>{change.record.name}</Link>
                        </ChakraLink>
                      ) : (
                        <Text as="span">{change.record_id}</Text>
                      )}
                      {change.record?.deleted && <Badge colorPalette="red">deleted</Badge>}
                      {change.fields?.length > 0 && change.operation === 'update' && (
                        <Text as="span" fontSize="xs" color="muted">
                          {change.fields.join(', ')}
                        </Text>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <Form method="post">
                      <input type="hidden" name="change" value={change.id} />
                      {actionData?.conflict && actionData.undo === change.id && (
                        <input type="hidden" name="force" value="on" />
                      )}
                      <Button
                        type="submit"
                        name="intent"
                        value="undo"
                        size="xs"
                        variant="outline"
                        aria-label={`Undo: ${verb} ${change.record?.name ?? change.record_id}`}
                      >
                        {actionData?.conflict && actionData.undo === change.id ? 'Undo anyway' : 'Undo'}
                      </Button>
                    </Form>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      <HStack justify="space-between" mt={4}>
        {page > 1 ? (
          <ChakraLink asChild>
            <Link to={pageLink(page - 1)}>← Newer</Link>
          </ChakraLink>
        ) : (
          <span />
        )}
        {hasMore && (
          <ChakraLink asChild>
            <Link to={pageLink(page + 1)}>Older →</Link>
          </ChakraLink>
        )}
      </HStack>
    </Box>
  );
};

export default Moderation;
