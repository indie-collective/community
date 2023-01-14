import {
  Box,
  Flex,
  HStack,
  Text,
  Link as ChakraLink,
  useColorModeValue,
  VStack,
  Collapse,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Wrap,
  WrapItem,
  Divider,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link, useLoaderData, useLocation } from '@remix-run/react';

import Logo from '../components/Logo';
import AvatarButton from './AvatarButton';
import SearchInput from './SearchInput';

function NavLink(props) {
  const { href, ...rest } = props;
  const location = useLocation();

  let isActive = false;
  if (href === '/') {
    isActive = location.pathname === '/';
  } else {
    isActive = location.pathname.startsWith(href);
  }

  return (
    <ChakraLink
      to={href}
      as={Link}
      aria-current={isActive ? 'page' : undefined}
      display="block"
      transition="all 0.3s"
      borderRadius="md"
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

  if (variant === 'mobile') {
    return (
      <>
        <Flex
          bg={bg}
          shadow="sm"
          width="100vw"
          px={4}
          py={2}
          justifyContent="space-between"
        >
          <Link to="/">
            <HStack as="span" spacing="2">
              <Logo />
              <Text as="span" fontWeight="bold" fontSize="xl">
                Community
              </Text>
            </HStack>
          </Link>

          <IconButton ml={2} icon={<HamburgerIcon />} onClick={onToggle} />
        </Flex>

        <Collapse in={isOpen}>
          <Box p={3}>
            <SearchInput defaultValue={search} />
          </Box>

          <Wrap as="nav" spacing={4} mt="10px" justify="center">
            <WrapItem>
              <NavLink href="/games">Games</NavLink>
            </WrapItem>
            <WrapItem>
              <NavLink href="/studios">Studios</NavLink>
            </WrapItem>
            <WrapItem>
              <NavLink href="/associations">Associations</NavLink>
            </WrapItem>
            <WrapItem>
              <NavLink href="/events">Events</NavLink>
            </WrapItem>
          </Wrap>

          {currentUser?.isAdmin && (
            <Wrap as="nav" spacing={4} mt="10px" justify="center">
              <WrapItem>
                <NavLink href="/admin/users">Users</NavLink>
                <NavLink href="/admin/changes">Changes</NavLink>
                <NavLink href="/admin/missing">Missing</NavLink>
              </WrapItem>
            </Wrap>
          )}

          <Wrap as="nav" spacing={4} mt="10px" justify="center">
            <WrapItem>
              <AvatarButton />
            </WrapItem>
          </Wrap>
        </Collapse>
      </>
    );
  }

  return (
    <Box bg={bg} shadow="sm">
      <Flex
        direction="column"
        pl={5}
        py={8}
        position="fixed"
        width="260px"
        top="0px"
        bottom="0px"
      >
        <Link to="/">
          <HStack as="span" spacing="2">
            <Logo />
            <Text as="span" fontWeight="bold" fontSize="xl">
              Community
            </Text>
          </HStack>
        </Link>

        <Box mt={5}>
          <SearchInput defaultValue={search} />
        </Box>

        <Box as="nav" flex="auto">
          <VStack as="ul" spacing={1} my={5} alignItems="stretch">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/games">Games</NavLink>
            <NavLink href="/studios">Studios</NavLink>
            <NavLink href="/associations">Associations</NavLink>
            <NavLink href="/events">Events</NavLink>
          </VStack>

          {currentUser?.isAdmin && (
            <Box bg="gray.200" p={1} borderRadius="md">
              <Text fontWeight="bold" color="gray.500" px={1} mb={3}>
                Admin
              </Text>
              <VStack as="ul" spacing={1} alignItems="stretch">
                <NavLink href="/admin/users">Users</NavLink>
                <NavLink href="/admin/changes">Changes</NavLink>
                <NavLink href="/admin/missing">Missing</NavLink>
              </VStack>
            </Box>
          )}
        </Box>

        <AvatarButton />
      </Flex>
    </Box>
  );
};

export default Navigation;
