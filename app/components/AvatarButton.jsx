import {
  HStack,
  Flex,
  Text,
  Button,
  Avatar,
} from '@chakra-ui/react';
import { useLocation, useRouteLoaderData } from 'react-router';
import Link from './Link';
import { useT } from '../i18n';

const AvatarButton = () => {
  const t = useT();
  const data = useRouteLoaderData('root');
  const { pathname, search } = useLocation();

  if (data?.currentUser) {
    const { first_name, username, avatar } = data.currentUser;

    return (
      <Link to="/profile">
        <HStack gap="1.5" pr={3}>
          <Avatar.Root size="md">
            <Avatar.Fallback name={first_name} />
            <Avatar.Image src={avatar} />
          </Avatar.Root>
          <Flex direction="column">
            <Text fontWeight="bold" mb="-2px">
              {first_name}
            </Text>
            <Text fontSize="small">@{username}</Text>
          </Flex>
        </HStack>
      </Link>
    );
  }

  // To the sign-in page, then back here.
  const prev = pathname === '/signin' ? '' : `?prev=${encodeURIComponent(pathname + search)}`;
  return (
    <Button asChild w="100%" size="lg" borderRadius="full">
      <Link to={`/signin${prev}`}>{t('nav.signIn')}</Link>
    </Button>
  );
};

export default AvatarButton;
