import { Box, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { useLoaderData } from 'react-router';

import Link from '../components/Link';
import { Page, PageHeader } from '../components/Page';
import { listNotifications, markAllRead } from '../data/notifications.server';
import isAuthenticated from '../utils/isAuthenticated.server';

// What happened to what a member follows (#343). Seen once shown.
export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);
  const notifications = await listNotifications(currentUser.id);
  await markAllRead(currentUser.id);
  return { notifications };
};

export const meta = () => [{ title: 'Notifications' }];

const Notifications = () => {
  const { notifications } = useLoaderData();
  return (
    <Page>
      <PageHeader
        title="Notifications"
        description="What happened to the games, studios, associations, events and countries you follow."
      />
      {notifications.length === 0 ? (
        <Text color="muted">
          Nothing yet. Follow games, studios, events or countries from their pages to hear about them here.
        </Text>
      ) : (
        <Stack gap={0} as="ul" listStyleType="none" m={0} p={0}>
          {notifications.map((notification) => (
            <Box
              as="li"
              key={notification.id}
              py={3}
              borderBottomWidth="1px"
              data-testid="notification"
              data-unread={notification.read ? undefined : ''}
              fontWeight={notification.read ? 'normal' : 'semibold'}
            >
              <ChakraLink asChild>
                <Link to={notification.path}>{notification.message}</Link>
              </ChakraLink>
              <Text fontSize="sm" color="muted" fontWeight="normal">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Page>
  );
};

export default Notifications;
