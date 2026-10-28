import { Badge, Box, Button, HStack, Link as ChakraLink, Stack, Tabs, Text } from '@chakra-ui/react';
import { Form, useLoaderData, useNavigate } from 'react-router';

import Link from '../../components/Link';
import { PageHeader } from '../../components/Page';
import { DUPLICATE_KINDS, dismissDuplicate, listSuspectedDuplicates } from '../../data/duplicates.server';
import isAuthenticated from '../../utils/isAuthenticated.server';

// Suspected and reported duplicates (#346), to merge or dismiss.

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
  return currentUser;
};

const kindOf = (request) => {
  const kind = new URL(request.url).searchParams.get('kind') ?? 'organization';
  return DUPLICATE_KINDS.includes(kind) ? kind : 'organization';
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  const kind = kindOf(request);
  return { kind, pairs: await listSuspectedDuplicates(kind) };
};

export const action = async ({ request }) => {
  const admin = await requireAdmin(request);
  const data = await request.formData();
  await dismissDuplicate(kindOf(request), data.get('a'), data.get('b'), { personId: admin.id });
  return { dismissed: true };
};

export const meta = () => [{ title: 'Duplicates - Community Administration' }];

const TABS = [
  ['organization', 'Studios and associations'],
  ['game', 'Games'],
  ['event', 'Events'],
];

const Record = ({ record }) => (
  <Box minW={0} flex="1">
    <ChakraLink asChild fontWeight="semibold">
      <Link to={record.path}>{record.name}</Link>
    </ChakraLink>
    <Text fontSize="sm" color="muted" lineClamp={1}>
      {[record.city, record.site, record.starts_at && new Date(record.starts_at).toISOString().slice(0, 10)]
        .filter(Boolean)
        .join(' · ') || ' '}
    </Text>
  </Box>
);

const Duplicates = () => {
  const { kind, pairs } = useLoaderData();
  const navigate = useNavigate();
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader
        eyebrow="Admin"
        title="Duplicates"
        description="Records that look like the same one, or that members reported. Merge them, or say they're different."
      />
      <Tabs.Root value={kind} onValueChange={({ value }) => navigate(`?kind=${value}`)} mb={4}>
        <Tabs.List>
          {TABS.map(([value, label]) => (
            <Tabs.Trigger key={value} value={value}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
      {pairs.length === 0 && <Text color="muted">No duplicates to check.</Text>}
      <Stack gap={3}>
        {pairs.map(({ a, b, reasons, flagged }) => (
          <Stack
            key={`${a.id}:${b.id}`}
            direction={{ base: 'column', md: 'row' }}
            gap={3}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            align={{ md: 'center' }}
            data-testid="duplicate-pair"
          >
            <Record record={a} />
            <Record record={b} />
            <HStack gap={1} wrap="wrap">
              {reasons.map((reason) => (
                <Badge key={reason} colorPalette={flagged && reason === 'flagged by a member' ? 'orange' : 'gray'}>
                  {reason}
                </Badge>
              ))}
            </HStack>
            <HStack>
              <Button asChild size="sm" colorPalette="green">
                <Link to={`/admin/duplicates/merge?kind=${kind}&a=${a.id}&b=${b.id}`}>Merge…</Link>
              </Button>
              <Form method="post">
                <input type="hidden" name="a" value={a.id} />
                <input type="hidden" name="b" value={b.id} />
                <Button type="submit" size="sm" variant="outline" aria-label={`${a.name} and ${b.name} are different`}>
                  Not the same
                </Button>
              </Form>
            </HStack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default Duplicates;
