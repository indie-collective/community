import { Box, Flex, HStack, chakra, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

import Logo from './Logo';
import AvatarButton from './AvatarButton';
import SearchInput from './SearchInput';

function NavLink(props) {
  const { href, ...rest } = props;
  const { pathname } = useRouter();

  const [, group] = href.split('/');
  const isActive = pathname.includes(group);

  return (
    <NextLink href={href} passHref>
      <chakra.a
        aria-current={isActive ? 'page' : undefined}
        display="block"
        mx="3"
        py="1"
        transition="all 0.3s"
        borderBottomWidth="3px"
        fontSize="18px"
        fontWeight="semibold"
        color={useColorModeValue('gray.500', 'white')}
        borderColor="transparent"
        _hover={{ borderColor: useColorModeValue('gray.400', 'white') }}
        _activeLink={{
          fontWeight: 'bold',
          color: 'teal.500',
          borderColor: 'teal.500',
        }}
        {...rest}
      />
    </NextLink>
  );
}

const Navigation = ({ search }) => {
  return (
    <Flex pl={5} pr={2} pt={5} alignItems="center">
      <NextLink href="/" passHref>
        <a>
          <Logo />
        </a>
      </NextLink>

      <HStack as="nav" spacing="4" ml="24px">
        <NavLink href="/games">Games</NavLink>
        <NavLink href="/orgs">Orgs</NavLink>
        <NavLink href="/events">Events</NavLink>
      </HStack>

      <Box flex="auto" />

      <SearchInput defaultValue={search} />

      <AvatarButton />
    </Flex>
  );
};

export default Navigation;
