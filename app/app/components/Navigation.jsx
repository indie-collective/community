import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  useColorModeValue,
  VStack,
  Collapse,
  IconButton,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link, useLoaderData, useLocation } from '@remix-run/react';

import Logo from '../components/Logo';
import AvatarButton from './AvatarButton';
import SearchInput from './SearchInput';

function NavLink(props) {
  const { href, ...rest } = props;
  const location = useLocation();

  const [, group] = href.split('/');
  const isActive = location.pathname.includes(group);

  return (
    <ChakraLink
      to={href}
      as={Link}
      aria-current={isActive ? 'page' : undefined}
      display="block"
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
  );
}

const Navigation = ({ search }) => {
  const { isOpen, onToggle } = useDisclosure();
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });

  const { currentUser } = useLoaderData();

  return (
    <>
      <Flex pt={5} alignItems="center" px={5}>
        <Link to="/">
          <Logo />
        </Link>

        {variant === 'desktop' && (
          <HStack as="nav" spacing={4} ml="24px">
            <NavLink href="/games">Games</NavLink>
            <NavLink href="/orgs">Orgs</NavLink>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/places">Places</NavLink>

            {currentUser?.isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </HStack>
        )}

        <Box flex="auto" />

        <SearchInput defaultValue={search} />

        {variant === 'mobile' && (
          <IconButton ml={2} icon={<HamburgerIcon />} onClick={onToggle} />
        )}

        {variant === 'desktop' && <AvatarButton />}
      </Flex>

      {variant === 'mobile' && (
        <Collapse in={isOpen}>
          <VStack as="nav" spacing={4} mt="24px">
            <NavLink href="/games">Games</NavLink>
            <NavLink href="/orgs">Orgs</NavLink>
            <NavLink href="/events">Events</NavLink>
            <NavLink href="/places">Places</NavLink>
            <AvatarButton />
          </VStack>
        </Collapse>
      )}
    </>
  );
};

export default Navigation;
