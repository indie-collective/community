import { Alert, Box, Button, Stack, Table, Text } from '@chakra-ui/react';
import { Form, useActionData, useLoaderData, useNavigation } from 'react-router';

import Label from '../../components/Label';
import Link from '../../components/Link';
import { PageHeader, Section } from '../../components/Page';
import festivals from '../../data/imports/indie-festivals-2026.json';
import { planEventImport, runEventImport } from '../../data/eventImport.server';
import { formatEventRange } from '../../utils/eventTime';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { eventPath } from '../../utils/slug';

// Events added in bulk from a reviewed file in the repository
// (app/data/imports): first what it would do, then the import.

const FILES = { 'indie-festivals-2026': festivals };

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
  return currentUser;
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  const plans = await Promise.all(
    Object.entries(FILES).map(async ([name, file]) => ({
      name,
      file: { source: file.source, hours: file.hours, leftOut: file.left_out },
      events: await planEventImport(file),
    }))
  );
  return { plans };
};

export const action = async ({ request }) => {
  const currentUser = await requireAdmin(request);
  const name = (await request.formData()).get('file');
  if (!FILES[name]) return { error: 'No such import file.' };
  return runEventImport(FILES[name], { authorId: currentUser.id });
};

export const meta = () => [{ title: 'Import events - Community Administration' }];

const when = (event) => {
  const zone = event.timeZone;
  return formatEventRange(`${event.start}T12:00:00Z`, `${event.end}T12:00:00Z`, zone, {
    time: false,
    locale: 'en',
  });
};

const Plan = ({ plan, busy }) => {
  const fresh = plan.events.filter((event) => !event.existing);
  return (
    <Section title={plan.name} count={plan.events.length} countLabel="events">
      <Text color="muted" fontSize="sm" mb={1}>
        From {plan.file.source}. {plan.file.hours}
      </Text>
      <Table.Root size="sm" mt={4} mb={6}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Event</Table.ColumnHeader>
            <Table.ColumnHeader>When</Table.ColumnHeader>
            <Table.ColumnHeader>Where</Table.ColumnHeader>
            <Table.ColumnHeader>Edition before</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {plan.events.map((event) => (
            <Table.Row key={event.key} data-testid="import-row">
              <Table.Cell>
                <Stack gap={1}>
                  <Text fontWeight="semibold">{event.name}</Text>
                  {event.existing ? (
                    <Text fontSize="xs" color="muted">
                      On the site already:{' '}
                      <Link to={eventPath(event.existing)}>{event.existing.name}</Link>
                    </Text>
                  ) : (
                    <Label tone="neutral" alignSelf="flex-start">
                      New
                    </Label>
                  )}
                  {event.check && (
                    <Text fontSize="xs" color="muted">
                      To check: {event.check}
                    </Text>
                  )}
                </Stack>
              </Table.Cell>
              <Table.Cell whiteSpace="nowrap">{when(event)}</Table.Cell>
              <Table.Cell>
                {event.online ? (
                  <Text>Online ({event.online})</Text>
                ) : (
                  <Stack gap={0}>
                    <Text>{event.place?.found ?? event.where}</Text>
                    <Text fontSize="xs" color="muted">
                      {event.place?.time_zone}
                    </Text>
                  </Stack>
                )}
              </Table.Cell>
              <Table.Cell>
                {event.previousOnSite ? (
                  <Link to={eventPath(event.previousOnSite)}>{event.previousOnSite.name}</Link>
                ) : event.previous?.key ? (
                  <Text>{plan.events.find((e) => e.key === event.previous.key)?.name}</Text>
                ) : event.missingPrevious ? (
                  <Text color="muted">Not on the site any more</Text>
                ) : null}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {plan.file.leftOut?.length > 0 && (
        <Box mb={6}>
          <Text fontWeight="semibold" fontSize="sm">
            Left out
          </Text>
          <Box as="ul" ps={5} fontSize="sm" color="muted">
            {plan.file.leftOut.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </Box>
        </Box>
      )}
      <Form method="post">
        <input type="hidden" name="file" value={plan.name} />
        <Button type="submit" loading={busy} disabled={fresh.length === 0}>
          {fresh.length === 0 ? 'Nothing new to import' : `Import ${fresh.length} events`}
        </Button>
      </Form>
    </Section>
  );
};

const Import = () => {
  const { plans } = useLoaderData();
  const result = useActionData();
  const busy = useNavigation().state !== 'idle';
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader
        eyebrow="Admin"
        title="Import events"
        description="Events from a reviewed file, each added as if through the event form, by you. Events already on the site, by name, are skipped."
      />
      {result?.error && (
        <Alert.Root status="error" mb={6}>
          <Alert.Description>{result.error}</Alert.Description>
        </Alert.Root>
      )}
      {result?.created && (
        <Alert.Root status="success" mb={6} data-testid="import-result">
          <Alert.Description>
            Added {result.created.length} events; skipped {result.skipped.length} already on the
            site.
          </Alert.Description>
        </Alert.Root>
      )}
      {plans.map((plan) => (
        <Plan key={plan.name} plan={plan} busy={busy} />
      ))}
    </Box>
  );
};

export default Import;
