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
} from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { useLocation, useNavigation, useRouteLoaderData } from 'react-router';
import Link from './Link';

import Logo from '../components/Logo';
import AccountMenu from './AccountMenu';
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

  // Root data, not this route's: this also renders inside the error boundary,
  // where the root loader may not have produced data.
  const { currentUser } = useRouteLoaderData('root') ?? {};


  if (variant === 'mobile') {
    return (
      <Box
        as="header"
        shadow="sm"
        bg="surface"
        width="100%"
        // Stays put while the page changes (view transitions).
        css={{ viewTransitionName: 'site-header' }}
      >
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
              <VStack as="nav" aria-label="Main" gap={2} px={4} align="stretch">
                <NavLink href="/games">Games</NavLink>
                <NavLink href="/studios">Studios</NavLink>
                <NavLink href="/associations">Associations</NavLink>
                <NavLink href="/events">Events</NavLink>
                <NavLink href="/countries">Countries</NavLink>
                <NavLink href="/places">Map</NavLink>

                <Box pt={2} display="flex" justifyContent="center">
                  <AccountMenu fullWidth />
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
      as="header"
      gap={0}
      width="100%"
      maxWidth={960}
      // Stays put while the page changes (view transitions).
      css={{ viewTransitionName: 'site-header' }}
    >
      {/* Top Level */}
      <Box w="100%" bg="surface" borderBottomRadius="30px">
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
              <AccountMenu />
            </HStack>
          </HStack>
        </Flex>
      </Box>
      {/* Second Level */}
      <Box w="100%" mt={2} py={2} px={2} bg="surface" borderRadius="full">
        <HStack as="nav" aria-label="Main" gap={4} width="100%">
          <NavLink href="/games">Games</NavLink>
          <NavLink href="/studios">Studios</NavLink>
          <NavLink href="/associations">Associations</NavLink>
          <NavLink href="/events">Events</NavLink>
          <NavLink href="/countries">Countries</NavLink>
          <NavLink href="/places">Map</NavLink>
          <Spacer />
        </HStack>
      </Box>
    </VStack>
  );
};

export default Navigation;
