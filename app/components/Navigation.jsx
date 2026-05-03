import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Link as ChakraLink,
  Collapsible,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Wrap,
  WrapItem,
  VisuallyHidden,
  Spacer,
  Button,
  Menu,
  Portal,
} from '@chakra-ui/react';
import { useColorModeValue } from './ui/color-mode';
import { LuMenu, LuChevronDown } from 'react-icons/lu';
import { Link, useLoaderData, useLocation, useNavigation } from 'react-router';

import Logo from '../components/Logo';
import AvatarButton from './AvatarButton';
import SearchInput from './SearchInput';
import AddMenuButton from './AddMenuButton';

function NavLink(props) {
  const { href, children, ...rest } = props;
  const location = useLocation();
  const navigation = useNavigation();

  const isActive =
    href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(href);
  const isNavigatingTo = navigation.location?.pathname === href;

  return (
    <Button
      variant={isActive ? 'solid' : 'ghost'}
      colorPalette="green"
      color={{
        base: isActive ? 'white' : 'gray.600',
        _dark: isActive ? 'white' : 'gray.300',
      }}
      fontWeight="bold"
      size="md"
      borderRadius="full"
      loading={isNavigatingTo}
      {...rest}
      asChild
    >
      <Link to={href}>{children}</Link>
    </Button>
  );
}

const Navigation = ({ search }) => {
  const { open, onToggle } = useDisclosure();

  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });

  const { currentUser } = useLoaderData();

  const AdminDropdown = ({ isMobile = false }) => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          size="md"
          variant="solid"
          borderRadius="full"
          colorPalette="gray"
          fontWeight="bold"
          textAlign="left"
          w={isMobile ? '100%' : 'auto'}
          justifyContent={isMobile ? 'space-between' : 'center'}
        >
          Admin
          <LuChevronDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="item-0" asChild cursor="pointer">
              <Link to="/admin/users">Users</Link>
            </Menu.Item>
            <Menu.Item value="item-1" asChild cursor="pointer">
              <Link to="/admin/changes">Changes</Link>
            </Menu.Item>
            <Menu.Item value="item-2" asChild cursor="pointer">
              <Link to="/admin/missing">Missing</Link>
            </Menu.Item>
            <Menu.Item value="item-3" asChild cursor="pointer">
              <Link to="/admin/tags">Tags</Link>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );

  if (variant === 'mobile') {
    return (
      <Box shadow="sm" bg={{ base: 'white', _dark: 'gray.900' }} width="100vw">
        <HStack
          gap={3}
          px={4}
          py={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Link to="/">
            <HStack as="span" gap="2">
              <Logo />
              <VisuallyHidden>Community</VisuallyHidden>
            </HStack>
          </Link>

          <HStack gap={2} flex="1" justifyContent="flex-end">
            <SearchInput />
            {currentUser && <AddMenuButton />}
            <IconButton variant="ghost" onClick={onToggle}>
              <LuMenu />
            </IconButton>
          </HStack>
        </HStack>
        <Collapsible.Root open={open}>
          <Collapsible.Content>
            <Box
              py={2}
              borderTop="1px solid"
              borderColor={{ base: 'gray.100', _dark: 'gray.700' }}
            >
              <VStack as="nav" gap={2} px={4} align="stretch">
                <NavLink href="/games">Games</NavLink>
                <NavLink href="/studios">Studios</NavLink>
                <NavLink href="/associations">Associations</NavLink>
                <NavLink href="/events">Events</NavLink>
                <NavLink href="/places">Map</NavLink>

                {currentUser?.isAdmin && <AdminDropdown isMobile />}

                <Box pt={2} display="flex" justifyContent="center">
                  <AvatarButton />
                </Box>
              </VStack>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>
    );
  }

  return (
    <VStack
      gap={0}
      width="100%"
      maxWidth={960}
    >
      {/* Top Level */}
      <Box
        w="100%"
        bg={{base: "white", _dark: 'gray.900' }}
        borderBottomRadius="30px"
      >
        <Flex justifyContent="center">
          <HStack
            gap={2}
            py={2}
            px={2}
            pl={3}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Link to="/">
              <Logo height="40px" />
              <VisuallyHidden>Community</VisuallyHidden>
            </Link>

            <SearchInput />

            <HStack gap={2} justifyContent="flex-end">
              {currentUser && <AddMenuButton />}
              <AvatarButton />
            </HStack>
          </HStack>
        </Flex>
      </Box>
      {/* Second Level */}
      <Box
        w="100%"
        mt={2}
        py={2}
        px={2}
        bg={{ base: 'white', _dark: 'gray.900' }}
        borderRadius="full"
      >
        <HStack as="nav" gap={4} width="100%">
          <NavLink href="/games">Games</NavLink>
          <NavLink href="/studios">Studios</NavLink>
          <NavLink href="/associations">Associations</NavLink>
          <NavLink href="/events">Events</NavLink>
          <NavLink href="/places">Map</NavLink>
          <Spacer />
          {currentUser?.isAdmin && <AdminDropdown />}
        </HStack>
      </Box>
    </VStack>
  );
};

export default Navigation;
