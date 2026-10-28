import { Alert, Avatar, Box, Grid, HStack, Link as ChakraLink, List, Stack, Text } from '@chakra-ui/react';
import { FaBluesky } from 'react-icons/fa6';
import { useLoaderData } from 'react-router';

import AchievementShelf from '../components/AchievementBadge';
import EventCard from '../components/EventCard';
import Link from '../components/Link';
import Markdown from '../components/Markdown';
import { Page, PageHeader, PageSection } from '../components/Page';
import { getPublicProfile } from '../data/profiles.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { pageMeta, summarize } from '../utils/meta';

// A member's public page (#341): who they are, the events they go to, and
// what they've added to the directory.
export const loader = async ({ request, params }) => {
  const viewer = await isAuthenticated(request);
  const profile = await getPublicProfile(params.username, { viewerId: viewer?.id });
  if (!profile) throw new Response('Not Found', { status: 404 });
  return { profile };
};

const fullName = (profile) => profile.first_name ?? '';

export const meta = ({ data, matches }) =>
  data
    ? pageMeta(matches, {
        title: `${fullName(data.profile)} (@${data.profile.username})`,
        description:
          summarize(data.profile.about) || `${fullName(data.profile)} on Indie Collective's community directory.`,
        image: data.profile.avatar?.url,
        path: `/people/${data.profile.username}`,
        type: 'profile',
      })
    : [{ title: 'Not found' }];

const KIND_LABELS = { game: 'game', organization: 'studio or association', event: 'event' };

const EventGrid = ({ events }) => (
  <Grid gap={4} templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
    {events.map((event) => (
      <Box minW={0} key={event.id}>
        <EventCard {...event} />
      </Box>
    ))}
  </Grid>
);

const PersonPage = () => {
  const { profile } = useLoaderData();
  const { username, about, bsky_handle, avatar, since, attending, contributions, own, hidden } = profile;
  const name = fullName(profile);

  return (
    <Page>
      {own && hidden && (
        <Alert.Root status="info" mb={6}>
          <Alert.Indicator />
          <Alert.Title>
            Only you can see this page: your profile is hidden.{' '}
            <ChakraLink asChild>
              <Link to="/profile/edit">Show it</Link>
            </ChakraLink>
          </Alert.Title>
        </Alert.Root>
      )}
      <HStack gap={{ base: 4, md: 6 }} align="center" mb={{ base: 6, md: 8 }}>
        <Avatar.Root size="2xl">
          <Avatar.Fallback name={name || username} />
          {avatar && <Avatar.Image src={avatar.thumbnail_url} alt="" />}
        </Avatar.Root>
        <PageHeader
          mb={0}
          flex="1"
          minW={0}
          eyebrow={`Member since ${new Date(since).getUTCFullYear()}`}
          title={name || `@${username}`}
          actions={
            own && (
              <ChakraLink asChild fontSize="sm">
                <Link to="/profile/edit">Edit your profile</Link>
              </ChakraLink>
            )
          }
        >
          <HStack gap={4} wrap="wrap" color="muted" fontSize="sm">
            <Text>@{username}</Text>
            {bsky_handle && (
              <ChakraLink href={`https://bsky.app/profile/${bsky_handle}`} target="_blank" rel="noopener noreferrer">
                <FaBluesky />@{bsky_handle}
              </ChakraLink>
            )}
          </HStack>
        </PageHeader>
      </HStack>

      {about && (
        <Box mb={{ base: 8, md: 10 }} maxW="2xl">
          <Markdown value={about} />
        </Box>
      )}

      <PageSection title="Contributions">
        {/* #339: from missions and every edit. */}
        <Box mb={5} data-testid="badges">
          <Text mb={profile.badges.length > 0 ? 4 : 0}>
            <b>{profile.points}</b> points · <b>{profile.completed}</b> records completed
          </Text>
          {/* Their badges, as medals (#377). */}
          {profile.badges.length > 0 && <AchievementShelf achievements={profile.badges} />}
        </Box>
        <Text mb={4} data-testid="contribution-counts">
          Added {contributions.added} {contributions.added === 1 ? 'record' : 'records'} and made{' '}
          {contributions.edited} {contributions.edited === 1 ? 'edit' : 'edits'}.
        </Text>
        {contributions.latest.length > 0 && (
          <List.Root gap={1} ps={5}>
            {contributions.latest.map((change) => (
              <List.Item key={change.id}>
                {change.operation === 'create' ? 'Added' : 'Edited'} the {KIND_LABELS[change.kind]}{' '}
                <ChakraLink asChild>
                  <Link to={change.path}>{change.name}</Link>
                </ChakraLink>{' '}
                <Text as="span" color="muted" fontSize="sm">
                  on{' '}
                  <time dateTime={new Date(change.created_at).toISOString()}>
                    {new Date(change.created_at).toLocaleDateString('en', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                </Text>
              </List.Item>
            ))}
          </List.Root>
        )}
      </PageSection>

      {attending.upcoming.length > 0 && (
        <PageSection title="Going to">
          <EventGrid events={attending.upcoming} />
        </PageSection>
      )}
      {attending.past.length > 0 && (
        <PageSection title="Went to">
          <EventGrid events={attending.past} />
        </PageSection>
      )}
      {attending.upcoming.length === 0 && attending.past.length === 0 && contributions.latest.length === 0 && (
        <Stack>
          <Text color="muted">Nothing to show yet.</Text>
        </Stack>
      )}
    </Page>
  );
};

export default PersonPage;
