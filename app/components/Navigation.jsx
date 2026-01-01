import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Link as ChakraLink,
  useColorModeValue,
  Collapse,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Wrap,
  WrapItem,
  VisuallyHidden,
  Spacer,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link, useLoaderData, useLocation, useNavigation } from '@remix-run/react';

import Logo from '../components/Logo';
import AvatarButton from './AvatarButton';
import SearchInput from './SearchInput';
import AddMenuButton from './AddMenuButton';

function NavLink(props) {
  const { href, children, ...rest } = props;
  const location = useLocation();
  const navigation = useNavigation();

  const isActive = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);
  const isNavigatingTo = navigation.location?.pathname === href;

  return (
    <Button
      as={Link}
      to={href}
      variant={isActive ? 'solid' : 'ghost'}
      colorScheme={isActive ? 'green' : 'gray'}
      color={isActive ? 'white' : useColorModeValue('gray.600', 'gray.300')}
      size="md"
      borderRadius="full"
      isLoading={isNavigatingTo}
      {...rest}
    >
      {children}
    </Button>
  );
}

const Navigation = ({ search }) => {
  const { isOpen, onToggle } = useDisclosure();
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  const background = useColorModeValue('white', 'gray.900');
  const secondaryBg = useColorModeValue('gray.50', 'gray.800');

  const { currentUser } = useLoaderData();

  const AdminDropdown = ({ isMobile = false }) => (
    <Menu>
      <MenuButton
        as={Button}
        size="md"
        variant="solid"
        rightIcon={<ChevronDownIcon />}
        borderRadius="full"
        colorScheme="gray"
        textAlign="left"
        w={isMobile ? "100%" : "auto"}
        justifyContent={isMobile ? "space-between" : "center"}
      >
        Admin
      </MenuButton>
      <MenuList zIndex={10}>
        <MenuItem as={Link} to="/admin/users">Users</MenuItem>
        <MenuItem as={Link} to="/admin/changes">Changes</MenuItem>
        <MenuItem as={Link} to="/admin/missing">Missing</MenuItem>
        <MenuItem as={Link} to="/admin/tags">Tags</MenuItem>
      </MenuList>
    </Menu>
  );

  if (variant === 'mobile') {
    return (
      <Box shadow="sm" background={background} width="100vw">
        <HStack
          spacing={3}
          px={4}
          py={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Link to="/">
            <HStack as="span" spacing="2">
              <Logo />
              <VisuallyHidden>Community</VisuallyHidden>
            </HStack>
          </Link>

          <HStack spacing={2} flex="1" justifyContent="flex-end">
            <SearchInput />
            {currentUser && <AddMenuButton />}
            <IconButton variant="ghost" icon={<HamburgerIcon />} onClick={onToggle} />
          </HStack>
        </HStack>

        <Collapse in={isOpen}>
          <Box py={2} borderTop="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
            <VStack spacing={2} px={4} align="stretch">
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
        </Collapse>
      </Box>
    );
  }

  return (
    <VStack spacing={0} width="100%" maxWidth={960} borderBottom="1px solid" borderColor={useColorModeValue('gray.100', 'gray.800')}>
      {/* Top Level */}
      <Box w="100%" bg={background}>
        <Flex justifyContent="center">
          <HStack
            spacing={2}
            py={3}
            px={5}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Link to="/">
              <Logo height="40px" />
              <VisuallyHidden>Community</VisuallyHidden>
            </Link>

            <SearchInput />

            <HStack spacing={2} justifyContent="flex-end">
              {currentUser && <AddMenuButton />}
              <AvatarButton />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* Second Level */}
      <Box w="100%" bg={secondaryBg} py={2} px={5}>
        <HStack
          spacing={4}
          width="100%"
        >
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
