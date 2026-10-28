import { Badge, Box, Button, HStack, NativeSelect, Table, Text } from '@chakra-ui/react';
import { useFetcher, useLoaderData } from 'react-router';

import { PageHeader } from '../../components/Page';
import { flagStates, setFlagState } from '../../data/featureFlags.server';
import { FEATURE_FLAGS, FLAG_STATES } from '../../utils/featureFlags';
import isAuthenticated from '../../utils/isAuthenticated.server';

// Feature flags: parts of the site hidden until they're ready, shown to
// admins only to try them out, or to everyone.

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  const states = await flagStates();
  return { flags: FEATURE_FLAGS.map((flag) => ({ ...flag, state: states[flag.key] })) };
};

export const action = async ({ request }) => {
  await requireAdmin(request);
  const form = await request.formData();
  try {
    await setFlagState(form.get('key'), form.get('state'));
  } catch {
    throw new Response('Bad Request', { status: 400 });
  }
  return { saved: form.get('key') };
};

export const meta = () => [{ title: 'Feature flags - Community Administration' }];

const STATE_COLORS = { off: 'gray', admins: 'orange', on: 'green' };
const stateLabel = (state) => FLAG_STATES.find(([value]) => value === state)?.[1] ?? state;

const FlagRow = ({ flag }) => {
  const fetcher = useFetcher();
  // What it's being set to, while it saves.
  const state = fetcher.formData?.get('state') ?? flag.state;
  return (
    <Table.Row data-testid="flag">
      <Table.Cell>
        <Text fontWeight="semibold">{flag.label}</Text>
        <Text color="muted" fontSize="sm">
          {flag.description}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Badge colorPalette={STATE_COLORS[state]} data-testid="flag-state">{stateLabel(state)}</Badge>
      </Table.Cell>
      <Table.Cell>
        <fetcher.Form method="post">
          <input type="hidden" name="key" value={flag.key} />
          <HStack gap={2}>
            <NativeSelect.Root size="sm" width="auto">
              <NativeSelect.Field name="state" aria-label={`Who sees ${flag.label}`} defaultValue={flag.state}>
                {FLAG_STATES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Button type="submit" size="sm" loading={fetcher.state !== 'idle'}>
              Save
            </Button>
          </HStack>
        </fetcher.Form>
      </Table.Cell>
    </Table.Row>
  );
};

const Flags = () => {
  const { flags } = useLoaderData();
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader
        eyebrow="Admin"
        title="Feature flags"
        description="Parts of the site that are hidden until they’re ready. “Admins only” lets you try one out first. Signed-out visitors may see the old state for up to a minute."
      />
      <Table.ScrollArea>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Feature</Table.ColumnHeader>
              <Table.ColumnHeader>Shown to</Table.ColumnHeader>
              <Table.ColumnHeader>Change</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {flags.map((flag) => (
              <FlagRow key={flag.key} flag={flag} />
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
};

export default Flags;
