import { Badge, Box, Button, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { useLoaderData } from 'react-router';

import Link from '../components/Link';
import { Page, PageHeader, PageSection } from '../components/Page';
import { countGaps, memberStats } from '../data/missions.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { pageMeta } from '../utils/meta';
import { GAPS, KIND_LABELS, MISSION_SIZE } from '../utils/missions';

// Fact-finding missions (#339): choose what to help with.
export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);
  const [counts, stats] = await Promise.all([countGaps(), currentUser ? memberStats(currentUser.id) : null]);
  return { counts, stats, signedIn: Boolean(currentUser) };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Help complete the map',
    description: 'Fact-finding missions: fill in what the indie scene directory is missing, ten records at a time.',
    path: location.pathname,
  });

const Missions = () => {
  const { counts, stats, signedIn } = useLoaderData();
  return (
    <Page>
      <PageHeader
        title="Help complete the map"
        description={`Fact-finding missions: ${MISSION_SIZE} records missing the same thing, one at a time. Fill in what you can find, skip what you can't, flag what's wrong.`}
      />
      {stats && (
        <HStack gap={6} mb={{ base: 6, md: 8 }} wrap="wrap" data-testid="my-stats">
          <Text>
            <b>{stats.points}</b> points
          </Text>
          <Text>
            <b>{stats.records}</b> records completed
          </Text>
          <HStack gap={2} wrap="wrap">
            {stats.achievements.map((achievement) => (
              <Badge key={achievement.key} colorPalette="yellow" title={achievement.description}>
                {achievement.name}
              </Badge>
            ))}
          </HStack>
        </HStack>
      )}
      {Object.entries(GAPS).map(([kind, gaps]) => (
        <PageSection key={kind} title={KIND_LABELS[kind]}>
          <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={3}>
            {gaps
              .filter((gap) => counts[kind][gap.key] > 0)
              .map((gap) => (
                <Stack key={gap.key} p={4} borderWidth="1px" borderRadius="lg" gap={2}>
                  <Heading as="h3" size="sm">
                    Missing: {gap.label.toLowerCase()}
                  </Heading>
                  <Text fontSize="sm" color="muted">
                    {counts[kind][gap.key].toLocaleString('en')} to find · {gap.weight} {gap.weight === 1 ? 'point' : 'points'} each
                  </Text>
                  <Box>
                    {signedIn ? (
                      <Button asChild size="sm" colorPalette="green">
                        <Link to={`/missions/${kind}/${gap.key}?start=${Date.now()}`} aria-label={`Start: ${KIND_LABELS[kind]} missing ${gap.label.toLowerCase()}`}>
                          Start
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/signin">Sign in to start</Link>
                      </Button>
                    )}
                  </Box>
                </Stack>
              ))}
          </Grid>
        </PageSection>
      ))}
    </Page>
  );
};

export default Missions;
