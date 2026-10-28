import { Badge, Box, Button, Grid, HStack, Link as ChakraLink, List, Stack, Tabs, Text } from '@chakra-ui/react';
import { Form, useLoaderData, useNavigate } from 'react-router';

import Link from '../../components/Link';
import { PageHeader, PageSection } from '../../components/Page';
import PersonLink from '../../components/PersonLink';
import { countGaps, listGapRecords, listMissionFlags, resolveFlag } from '../../data/missions.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import { FLAG_REASONS, GAPS, KIND_LABELS, MISSION_KINDS, gapOf } from '../../utils/missions';

// What's missing (#339): the same gaps as missions, counted by kind, each
// listed in full, and what members flagged on missions.

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  const params = new URL(request.url).searchParams;
  const kind = MISSION_KINDS.includes(params.get('kind')) ? params.get('kind') : 'game';
  const gap = gapOf(kind, params.get('gap')) ?? GAPS[kind][0];
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [counts, list, flags] = await Promise.all([countGaps(), listGapRecords(kind, gap.key, { page }), listMissionFlags()]);
  return { counts, kind, gap: gap.key, page, ...list, flags };
};

export const action = async ({ request }) => {
  await requireAdmin(request);
  const data = await request.formData();
  await resolveFlag(data.get('person'), data.get('kind'), data.get('record'));
  return { resolved: true };
};

export const meta = () => [{ title: 'Missing data - Community Administration' }];

const REASONS = Object.fromEntries(FLAG_REASONS);

const Missing = () => {
  const { counts, kind, gap, page, records, hasMore, flags } = useLoaderData();
  const navigate = useNavigate();
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader
        eyebrow="Admin"
        title="Missing data"
        description="What records are missing, as members see it on missions (/missions)."
      />

      {flags.length > 0 && (
        <PageSection title="Flagged on missions">
          <Stack gap={2}>
            {flags.map((flag) => (
              <HStack key={`${flag.person_id}:${flag.record_id}`} gap={3} wrap="wrap" data-testid="mission-flag">
                <Badge colorPalette="orange">{REASONS[flag.reason] ?? flag.reason}</Badge>
                <ChakraLink asChild>
                  <Link to={flag.path}>{flag.name}</Link>
                </ChakraLink>
                <Text fontSize="sm" color="muted">
                  by <PersonLink username={flag.username} />
                </Text>
                <Form method="post">
                  <input type="hidden" name="person" value={flag.person_id} />
                  <input type="hidden" name="kind" value={flag.kind} />
                  <input type="hidden" name="record" value={flag.record_id} />
                  <Button type="submit" size="xs" variant="outline">
                    Dealt with
                  </Button>
                </Form>
              </HStack>
            ))}
          </Stack>
        </PageSection>
      )}

      <Tabs.Root value={kind} onValueChange={({ value }) => navigate(`?kind=${value}`)} mb={4}>
        <Tabs.List>
          {MISSION_KINDS.map((value) => (
            <Tabs.Trigger key={value} value={value}>
              {KIND_LABELS[value]}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
      <Grid templateColumns={['repeat(2, 1fr)', 'repeat(3, 1fr)', 'repeat(5, 1fr)']} gap={2} mb={6}>
        {GAPS[kind].map((item) => (
          <Button
            key={item.key}
            asChild
            variant={item.key === gap ? 'solid' : 'outline'}
            size="sm"
            justifyContent="space-between"
          >
            <Link to={`?kind=${kind}&gap=${item.key}`} data-testid={`gap-${item.key}`}>
              {item.label} <Badge ml={2}>{counts[kind][item.key].toLocaleString('en')}</Badge>
            </Link>
          </Button>
        ))}
      </Grid>
      <List.Root ps={5} gap={1}>
        {records.map((record) => (
          <List.Item key={record.id}>
            <ChakraLink asChild>
              <Link to={record.path}>{record.name}</Link>
            </ChakraLink>
          </List.Item>
        ))}
      </List.Root>
      <HStack justify="space-between" mt={4}>
        {page > 1 ? <Link to={`?kind=${kind}&gap=${gap}&page=${page - 1}`}>← Newer</Link> : <span />}
        {hasMore && <Link to={`?kind=${kind}&gap=${gap}&page=${page + 1}`}>Older →</Link>}
      </HStack>
    </Box>
  );
};

export default Missing;
