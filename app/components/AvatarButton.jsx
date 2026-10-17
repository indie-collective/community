import { HStack, Flex, Text, Button, Avatar } from '@chakra-ui/react';
import { useLocation, useRouteLoaderData } from 'react-router';
import { LuLogIn } from 'react-icons/lu';
import Link from './Link';

const AvatarButton = () => {
  const data = useRouteLoaderData('root');
  const { pathname, search } = useLocation();

  if (data?.currentUser) {
    const { first_name, username, avatar } = data.currentUser;

    return (
      <Link to="/profile">
        <HStack gap="2" pr={1}>
          {/* Ringed in ink, as the masthead's other pressable things. */}
          <Avatar.Root size="md" borderWidth="2px" borderColor="ink">
            <Avatar.Fallback name={first_name} />
            <Avatar.Image src={avatar} />
          </Avatar.Root>
          <Flex direction="column">
            <Text fontWeight="bold" mb="-2px">
              {first_name}
            </Text>
            <Text fontSize="xs" color="muted">
              @{username}
            </Text>
          </Flex>
        </HStack>
      </Link>
    );
  }

  // To the sign-in page, then back here.
  const prev =
    pathname === '/signin'
      ? ''
      : `?prev=${encodeURIComponent(pathname + search)}`;
  return (
    // The magazine's pressable button: ink, with a hard shadow under the
    // pointer. Full width in the phone menu.
    <Button
      asChild
      variant="pop"
      w={{ base: '100%', md: 'auto' }}
      size="md"
      px={5}
      borderRadius="full"
    >
      <Link to={`/signin${prev}`}>
        <LuLogIn />
        Sign in
      </Link>
    </Button>
  );
};

export default AvatarButton;
