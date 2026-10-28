import { Box, Button, Field, Grid, Heading, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { Form, redirect, useLoaderData, useNavigation } from 'react-router';

import { PageHeader } from '../../components/Page';
import {
  DUPLICATE_KINDS,
  defaultChoices,
  getMergeCandidates,
  mergeRecords,
} from '../../data/duplicates.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { eventPath, gamePath, orgPath } from '../../utils/slug';

// Merging two records into one (#346): which one stays, and for each field,
// whose value it keeps.

const PATHS = { game: gamePath, organization: orgPath, event: eventPath };

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
  return currentUser;
};

const pairOf = (request) => {
  const params = new URL(request.url).searchParams;
  const kind = params.get('kind');
  if (!DUPLICATE_KINDS.includes(kind)) throw new Response('Not Found', { status: 404 });
  return { kind, a: params.get('a'), b: params.get('b') };
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  const { kind, a, b } = pairOf(request);
  const candidates = await getMergeCandidates(kind, a, b);
  if (!candidates) throw new Response('Not Found', { status: 404 });
  return { kind, ...candidates, choices: defaultChoices(candidates) };
};

export const action = async ({ request }) => {
  const admin = await requireAdmin(request);
  const { kind, a, b } = pairOf(request);
  const data = await request.formData();
  const keep = data.get('keep') === b ? b : a;
  const other = keep === a ? b : a;
  const candidates = await getMergeCandidates(kind, a, b);
  if (!candidates) throw new Response('Not Found', { status: 404 });
  // Each field names the record it comes from.
  const choices = Object.fromEntries(
    candidates.fields.map(([field]) => [field, data.get(field) === other ? 'other' : 'keep'])
  );
  const kept = await mergeRecords(kind, keep, other, choices, { adminId: admin.id });
  return redirect(PATHS[kind](kept));
};

export const meta = () => [{ title: 'Merge - Community Administration' }];

const show = (values) => {
  const text = values
    .filter((value) => value != null && value !== '')
    .map((value) => (value instanceof Date || /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value).toISOString().slice(0, 16).replace('T', ' ') : String(value)))
    .join(', ');
  return text.length > 160 ? `${text.slice(0, 159)}…` : text || '—';
};

const Merge = () => {
  const { fields, records, choices } = useLoaderData();
  const navigation = useNavigation();
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12} maxW="5xl">
      <PageHeader
        eyebrow="Admin · Duplicates"
        title="Merge two records"
        description="One record stays, with every link of both (games, studios, events, images…). The other is deleted, and its address leads to the one that stays."
      />
      <Form method="post">
        <Stack gap={6}>
          <Field.Root>
            <Field.Label>Which one stays (its address is kept)</Field.Label>
            <RadioGroup.Root name="keep" defaultValue={records[0].id}>
              <Stack>
                {records.map((record) => (
                  <RadioGroup.Item key={record.id} value={record.id}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>
                      {record.name} <Text as="span" color="muted">({record.path})</Text>
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          <Heading as="h2" size="md">
            For each field, keep
          </Heading>
          {fields.map(([field, label]) => (
            <Field.Root key={field}>
              <Field.Label>{label}</Field.Label>
              <RadioGroup.Root name={field} defaultValue={records[choices[field]].id}>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={2} width="100%">
                  {records.map((record) => (
                    <RadioGroup.Item
                      key={record.id}
                      value={record.id}
                      alignItems="flex-start"
                      aria-label={`${label} from ${record.name}`}
                    >
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText overflowWrap="anywhere">{show(record.values[field])}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  ))}
                </Grid>
              </RadioGroup.Root>
            </Field.Root>
          ))}
          <Box>
            <Button type="submit" colorPalette="green" loading={navigation.state !== 'idle'}>
              Merge
            </Button>
          </Box>
        </Stack>
      </Form>
    </Box>
  );
};

export default Merge;
