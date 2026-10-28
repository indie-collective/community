import { Alert, Box, Button, Text } from '@chakra-ui/react';
import { Form, useActionData, useLoaderData, useNavigation } from 'react-router';

import { PageHeader } from '../../components/Page';
import { postWeeklySummary, weeklySummary } from '../../data/weeklySummary.server';
import isAuthenticated from '../../utils/isAuthenticated.server';
import getOrigin from '../../utils/origin.server';

// The weekly Bluesky summary (#319): what Monday's post will say, and
// posting it now if it didn't go out.

const requireAdmin = async (request) => {
  const currentUser = await isAuthenticated(request, true);
  if (!currentUser.isAdmin) throw new Response('Not Found', { status: 404 });
};

export const loader = async ({ request }) => {
  await requireAdmin(request);
  return { summary: await weeklySummary(new Date(), { origin: getOrigin(request) }) };
};

export const action = async ({ request }) => {
  await requireAdmin(request);
  return postWeeklySummary({ force: true, origin: getOrigin(request) });
};

export const meta = () => [{ title: 'Bluesky summary - Community Administration' }];

const Bluesky = () => {
  const { summary } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  return (
    <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12} maxW="2xl">
      <PageHeader
        eyebrow="Admin"
        title="Weekly Bluesky summary"
        description="Every Monday at 9:00 (Paris), the IC account posts what was added during the week before. Nothing is posted in a week without additions."
      />
      {actionData && (
        <Alert.Root status={actionData.posted ? 'success' : 'info'} mb={4}>
          <Alert.Indicator />
          <Alert.Title>{actionData.posted ? 'Posted.' : 'Nothing to post.'}</Alert.Title>
        </Alert.Root>
      )}
      {summary ? (
        <>
          <Text fontWeight="semibold" mb={2}>
            The past seven days would read:
          </Text>
          <Box p={4} borderWidth="1px" borderRadius="lg" mb={4} whiteSpace="pre-wrap" data-testid="summary-preview">
            {summary.text}
            {'\n\n'}
            {summary.url}
          </Box>
          <Form method="post">
            <Button type="submit" colorPalette="blue" loading={navigation.state !== 'idle'}>
              Post it now
            </Button>
          </Form>
        </>
      ) : (
        <Text color="muted">Nothing was added in the past seven days.</Text>
      )}
    </Box>
  );
};

export default Bluesky;
