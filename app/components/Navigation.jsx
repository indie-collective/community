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
      borderRadius="lg"
      fontSize="18px"
      fontWeight="semibold"
      color={useColorModeValue('gray.500', 'white')}
      px="10px"
      py="5px"
      backgroundColor="transparent"
      _hover={{
        backgroundColor: useColorModeValue('gray.400', 'gray.700'),
        color: useColorModeValue('white', 'gray.400'),
      }}
      _activeLink={{
        color: 'white',
        backgroundColor: 'teal.500',
      }}
      {...rest}
    />
  );
}

const Navigation = ({ search }) => {
  const { isOpen, onToggle } = useDisclosure();
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  const bg = useColorModeValue('white', 'gray.900');

  const { currentUser } = useLoaderData();

  return (
    <Box bg={bg} shadow="sm">
      <Flex px={5} py={3} alignItems="center" mx="auto" maxWidth="960px">
        <Link to="/">
          <Logo />
        </Link>

        {variant === 'desktop' && (
          <HStack as="nav" spacing={4} ml="24px">
            <NavLink href="/games">Games</NavLink>
            <NavLink href="/studios">Studios</NavLink>
            <NavLink href="/associations">Associations</NavLink>
            <NavLink href="/events">Events</NavLink>

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
            <NavLink href="/studios">Studios</NavLink>
            <NavLink href="/associations">Associations</NavLink>
            <NavLink href="/events">Events</NavLink>

            {currentUser?.isAdmin && <NavLink href="/admin">Admin</NavLink>}

            <AvatarButton />
          </VStack>
        </Collapse>
      )}
    </Box>
  );
};

export default Navigation;
