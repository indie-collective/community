import { Avatar, Box, Button, Menu, Portal, Text } from '@chakra-ui/react';
import { LuLogOut, LuShield, LuUser } from 'react-icons/lu';
import { Form, useLocation, useRouteLoaderData } from 'react-router';

import Link from './Link';

const ADMIN_PAGES = [
  ['/admin/users', 'Members and roles'],
  ['/admin/changes', 'Changes'],
  ['/admin/missing', 'Missing data'],
  ['/admin/tags', 'Tags'],
];

/**
 * The end of the header (design pass): signed out, a Sign in button that
 * comes back here; signed in, the avatar, whose menu has the profile, the
 * admin pages for admins, and sign out.
 */
const AccountMenu = ({ fullWidth = false }) => {
  const data = useRouteLoaderData('root');
  const { pathname, search } = useLocation();
  const user = data?.currentUser;

  if (!user) {
    const prev =
      pathname === '/signin'
        ? ''
        : `?prev=${encodeURIComponent(pathname + search)}`;
    return (
      <Button
        asChild
        variant="outline"
        borderRadius="full"
        w={fullWidth ? '100%' : 'auto'}
      >
        <Link to={`/signin${prev}`}>Sign in</Link>
      </Button>
    );
  }

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild>
        <Button
          variant="ghost"
          borderRadius="full"
          p={0}
          h="auto"
          minW={0}
          aria-label="Your account"
        >
          <Avatar.Root size="md">
            <Avatar.Fallback name={user.first_name} />
            {user.avatar && <Avatar.Image src={user.avatar} />}
          </Avatar.Root>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="220px">
            <Box px={2} py={1.5} mb={1}>
              <Text fontWeight="semibold">{user.first_name}</Text>
              <Text fontSize="sm" color="muted">
                @{user.username}
                {user.isAdmin && ' · admin'}
              </Text>
            </Box>
            <Menu.Separator />
            <Menu.Item value="profile" asChild>
              <Link to="/profile">
                <LuUser />
                Your profile
              </Link>
            </Menu.Item>
            {user.isAdmin && (
              <Menu.ItemGroup>
                <Menu.ItemGroupLabel
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                >
                  <LuShield />
                  Admin
                </Menu.ItemGroupLabel>
                {ADMIN_PAGES.map(([to, label]) => (
                  <Menu.Item key={to} value={to} asChild>
                    <Link to={to}>{label}</Link>
                  </Menu.Item>
                ))}
              </Menu.ItemGroup>
            )}
            <Menu.Separator />
            <Form method="post" action="/logout">
              <Menu.Item value="sign-out" asChild>
                <button type="submit" style={{ width: '100%' }}>
                  <LuLogOut />
                  Sign out
                </button>
              </Menu.Item>
            </Form>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default AccountMenu;
