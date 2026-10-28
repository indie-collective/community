import { Alert, Box, Button, HStack, Link as ChakraLink, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router';
import AchievementShelf from '../components/AchievementBadge';
import { LuExternalLink } from 'react-icons/lu';

import Link from '../components/Link';
import MissionInput from '../components/MissionInput';
import { Page, PageHeader } from '../components/Page';
import {
  fillGap,
  flagRecord,
  memberStats,
  nextMissionRecord,
  skipRecord,
} from '../data/missions.server';
import { actionErrorMessage } from '../utils/actionError.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { FLAG_REASONS, KIND_LABELS, MISSION_KINDS, MISSION_SIZE, gapOf } from '../utils/missions';
import { pickedOrCreated } from '../utils/quickCreate.server';

// A mission (#339): MISSION_SIZE records missing the same thing, one at a
// time (?n=1…), then what it earned (since ?start=).

const missionOf = (params) => {
  const gap = MISSION_KINDS.includes(params.kind) && gapOf(params.kind, params.gap);
  if (!gap) throw new Response('Not Found', { status: 404 });
  return gap;
};

const stepOf = (url) => ({
  n: Math.max(1, Number(url.searchParams.get('n')) || 1),
  start: Number(url.searchParams.get('start')) || Date.now(),
});

export const loader = async ({ request, params }) => {
  const currentUser = await isAuthenticated(request, true);
  const gap = missionOf(params);
  const { n, start } = stepOf(new URL(request.url));
  const next = n <= MISSION_SIZE ? await nextMissionRecord(currentUser.id, params.kind, gap.key) : null;
  if (next) return { kind: params.kind, gap, n, start, next };
  // Done: what it earned, and which badges are new.
  const since = new Date(start);
  const [earned, before, now] = await Promise.all([
    memberStats(currentUser.id, { since }),
    memberStats(currentUser.id, { before: since }),
    memberStats(currentUser.id),
  ]);
  const had = new Set(before.achievements.map((a) => a.key));
  return {
    kind: params.kind,
    gap,
    n,
    start,
    summary: {
      points: earned.points,
      completed: earned.missions,
      unlocked: now.achievements.filter((a) => !had.has(a.key)),
      ranOut: n <= MISSION_SIZE,
    },
  };
};

export async function action(args) {
  const currentUser = await authorizer.authorize(args, { rules: [canWrite] });
  const { params, request } = args;
  const gap = missionOf(params);
  const url = new URL(request.url);
  const { n, start } = stepOf(url);
  // An image is uploaded (#378), once the member is known to be allowed.
  const data = await parseFormWithUploads(request, gap.input === 'image' ? ['upload'] : []);
  const recordId = data.get('record');
  try {
    switch (data.get('intent')) {
      case 'fill':
        // The organisation picked, or added from the picker (#374).
        if (gap.input === 'organization' && (data.get('id') || data.get('name'))) {
          data.set('organization', (await pickedOrCreated('organization', data, { request, currentUser })).id);
        }
        await fillGap(currentUser.id, params.kind, recordId, gap.key, data);
        break;
      case 'flag':
        await flagRecord(currentUser.id, params.kind, recordId, gap.key, data.get('reason'));
        break;
      default:
        await skipRecord(currentUser.id, params.kind, recordId, gap.key);
    }
  } catch (err) {
    return { error: await actionErrorMessage(err) };
  }
  return redirect(`${url.pathname}?start=${start}&n=${n + 1}`);
}

export const meta = ({ data }) => [{ title: data ? `Mission: ${data.gap.label.toLowerCase()}` : 'Mission' }];

const Summary = ({ kind, gap, summary }) => (
  <Stack gap={4} maxW="xl" data-testid="mission-summary">
    <Text fontSize="lg">
      {summary.ranOut ? 'That was the last one for now. ' : 'Mission complete! '}
      You completed <b>{summary.completed}</b> {summary.completed === 1 ? 'record' : 'records'} and earned <b>{summary.points}</b>{' '}
      {summary.points === 1 ? 'point' : 'points'}.
    </Text>
    {summary.unlocked.length > 0 && (
      // Just earned: they pop in (#377).
      <Box bg="surface" borderRadius="xl" shadow="xs" p={5}>
        <Text fontWeight="semibold" mb={4}>
          {summary.unlocked.length === 1 ? 'New badge!' : `${summary.unlocked.length} new badges!`}
        </Text>
        <AchievementShelf achievements={summary.unlocked} size="lg" celebrate />
      </Box>
    )}
    <HStack>
      {!summary.ranOut && (
        <Button asChild colorPalette="green">
          <Link to={`/missions/${kind}/${gap.key}?start=${Date.now()}`}>Start another</Link>
        </Button>
      )}
      <Button asChild variant="outline">
        <Link to="/missions">Choose another mission</Link>
      </Button>
    </HStack>
  </Stack>
);

const Mission = () => {
  const { kind, gap, n, next, summary } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const busy = navigation.state !== 'idle';
  const title = `${KIND_LABELS[kind]} missing ${gap.label.toLowerCase()}`;
  if (summary) {
    return (
      <Page>
        <PageHeader eyebrow="Mission" title={title} />
        <Summary kind={kind} gap={gap} summary={summary} />
      </Page>
    );
  }
  const { record } = next;
  return (
    <Page>
      <PageHeader eyebrow={`Mission · ${n} of ${MISSION_SIZE}`} title={title} />
      <Stack gap={5} maxW="2xl">
        <Box p={4} borderWidth="1px" borderRadius="lg">
          <Text fontWeight="semibold" fontSize="lg">
            <ChakraLink asChild>
              <Link to={record.path} target="_blank" data-testid="mission-record">
                {record.name}
              </Link>
            </ChakraLink>
          </Text>
          <Text fontSize="sm" color="muted">
            {[record.city, record.country_code, record.site].filter(Boolean).join(' · ') || ' '}
          </Text>
          {record.about && gap.key !== 'about' && (
            <Text mt={2} lineClamp={3}>
              {record.about}
            </Text>
          )}
          <HStack mt={3} gap={4} fontSize="sm" wrap="wrap">
            <ChakraLink href={`https://duckduckgo.com/?q=${encodeURIComponent(record.name)}`} target="_blank" rel="noopener noreferrer">
              Search the web <LuExternalLink />
            </ChakraLink>
            {kind === 'game' && (
              <ChakraLink href={`https://store.steampowered.com/search/?term=${encodeURIComponent(record.name)}`} target="_blank" rel="noopener noreferrer">
                Steam <LuExternalLink />
              </ChakraLink>
            )}
            {record.site && (
              <ChakraLink href={record.site} target="_blank" rel="noopener noreferrer">
                Its website <LuExternalLink />
              </ChakraLink>
            )}
          </HStack>
        </Box>

        {actionData?.error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>{actionData.error}</Alert.Title>
          </Alert.Root>
        )}

        <Form method="post" key={record.id} encType={gap.input === 'image' ? 'multipart/form-data' : undefined}>
          <input type="hidden" name="record" value={record.id} />
          <MissionInput kind={kind} gap={gap} />
          <HStack mt={4} gap={2} wrap="wrap">
            <Button type="submit" name="intent" value="fill" colorPalette="green" loading={busy}>
              Save and next
            </Button>
            <Button type="submit" name="intent" value="skip" variant="outline" disabled={busy}>
              I don&apos;t know, skip
            </Button>
          </HStack>
        </Form>

        <Form method="post">
          <input type="hidden" name="record" value={record.id} />
          <HStack gap={2} wrap="wrap">
            <NativeSelect.Root size="sm" width="auto">
              <NativeSelect.Field name="reason" aria-label="What's wrong">
                {FLAG_REASONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Button type="submit" name="intent" value="flag" size="sm" variant="ghost" disabled={busy}>
              Flag it
            </Button>
          </HStack>
        </Form>
      </Stack>
    </Page>
  );
};

export default Mission;
