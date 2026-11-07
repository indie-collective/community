import {
  Badge,
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
import { LuBell, LuMenu, LuChevronDown } from 'react-icons/lu';
import { useLocation, useNavigation, useRouteLoaderData } from 'react-router';
import Link from './Link';

import Logo from '../components/Logo';
import AvatarButton from './AvatarButton';
import SearchInput from './SearchInput';
import AddMenuButton from './AddMenuButton';
import { useT } from '../i18n';
import useFeature from '../hooks/useFeature';

function NavLink(props) {
  const { href, children, ...rest } = props;
  const location = useLocation();
  const navigation = useNavigation();

  const isActive =
    href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(href);
  const isNavigatingTo = navigation.location?.pathname === href;

  // Magazine pass: the current section is an ink pill; the others tilt a
  // little onto a panel under the pointer.
  return (
    <Button
      variant="ghost"
      bg={isActive ? 'ink' : 'transparent'}
      color={isActive ? 'canvas' : 'ink'}
      fontWeight="semibold"
      size="sm"
      px={3}
      borderRadius="full"
      transition="transform 150ms ease-out, background-color 150ms ease-out"
      _hover={
        isActive ? { bg: 'ink' } : { bg: 'surface', transform: 'rotate(-2deg)' }
      }
      aria-current={isActive ? 'page' : undefined}
      loading={isNavigatingTo}
      {...rest}
      asChild
    >
      <Link to={href}>{children}</Link>
    </Button>
  );
}

// The masthead's name: the logo, and the title beside it on wide screens.
const Wordmark = ({ showTitle }) => (
  <Link to="/">
    <HStack as="span" gap={2.5}>
      <Logo height={showTitle ? '36px' : '32px'} />
      {showTitle ? (
        <Flex as="span" direction="column" lineHeight="1">
          <Text
            as="span"
            fontFamily="heading"
            fontWeight="800"
            fontSize="xl"
            letterSpacing="-0.03em"
          >
            Indie Collective
          </Text>
          <Text
            as="span"
            fontSize="2xs"
            fontWeight="semibold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="brandDeep"
            mt={0.5}
          >
            Community
          </Text>
        </Flex>
      ) : (
        <VisuallyHidden>Community</VisuallyHidden>
      )}
    </HStack>
  </Link>
);

// [href, message key, feature flag it needs]
const NAV = [
  ['/games', 'nav.games'],
  ['/studios', 'nav.studios'],
  ['/associations', 'nav.associations'],
  ['/publishers', 'nav.publishers'],
  ['/events', 'nav.events'],
  ['/opportunities', 'nav.opportunities', 'opportunities'],
  ['/countries', 'nav.countries'],
  ['/places', 'nav.map'],
];

const Navigation = ({ search }) => {
  const { open, onToggle } = useDisclosure();

  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });

  // Root data, not this route's: this also renders inside the error boundary,
  // where the root loader may not have produced data.
  const { currentUser, unreadNotifications = 0 } =
    useRouteLoaderData('root') ?? {};
  const t = useT();
  const features = { opportunities: useFeature('opportunities') };
  // Sections behind a flag that's off for them stay out of the header.
  const nav = NAV.filter(([, , flag]) => !flag || features[flag]);

  // #343: what happened to what they follow.
  const Bell = () => (
    <Box position="relative">
      <IconButton
        asChild
        variant="popOutline"
        rounded="full"
        aria-label={
          unreadNotifications > 0
            ? t('nav.notificationsUnread', { count: unreadNotifications })
            : t('nav.notifications')
        }
      >
        <Link to="/notifications">
          <LuBell />
        </Link>
      </IconButton>
      {unreadNotifications > 0 && (
        <Badge
          position="absolute"
          top="0"
          right="0"
          size="xs"
          bg="coral"
          color="onPop"
          borderWidth="2px"
          borderColor="ink"
          borderRadius="full"
          pointerEvents="none"
          aria-hidden
        >
          {unreadNotifications > 99 ? '99+' : unreadNotifications}
        </Badge>
      )}
    </Box>
  );

  const AdminDropdown = ({ isMobile = false }) => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          size="sm"
          variant="popOutline"
          borderRadius="full"
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
              <Link to="/admin/changes">Moderation</Link>
            </Menu.Item>
            <Menu.Item value="item-2" asChild cursor="pointer">
              <Link to="/admin/missing">Missing</Link>
            </Menu.Item>
            <Menu.Item value="item-3" asChild cursor="pointer">
              <Link to="/admin/tags">Tags</Link>
            </Menu.Item>
            <Menu.Item value="item-4" asChild cursor="pointer">
              <Link to="/admin/duplicates">Duplicates</Link>
            </Menu.Item>
            <Menu.Item value="item-5" asChild cursor="pointer">
              <Link to="/admin/bluesky">Bluesky summary</Link>
            </Menu.Item>
            <Menu.Item value="item-6" asChild cursor="pointer">
              <Link to="/admin/sources">Sources</Link>
            </Menu.Item>
            <Menu.Item value="item-7" asChild cursor="pointer">
              <Link to="/admin/flags">Feature flags</Link>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );

  if (variant === 'mobile') {
    return (
      <Box
        as="header"
        bg="canvas"
        width="100%"
        borderBottom="2px solid"
        borderColor="ink"
        // Stays put while the page changes (view transitions).
        css={{ viewTransitionName: 'site-header' }}
      >
        <HStack
          gap={3}
          px={4}
          py={2.5}
          justifyContent="space-between"
          alignItems="center"
        >
          <Wordmark />

          <HStack gap={2} flex="1" justifyContent="flex-end">
            <SearchInput />
            {currentUser && <AddMenuButton />}
            {currentUser && <Bell />}
            <IconButton
              variant="popOutline"
              size="md"
              rounded="full"
              aria-label={t('nav.menu')}
              aria-expanded={open}
              onClick={onToggle}
            >
              <LuMenu />
            </IconButton>
          </HStack>
        </HStack>
        <Collapsible.Root open={open}>
          <Collapsible.Content>
            <Box py={3} borderTop="1px dashed" borderColor="rule">
              <VStack
                as="nav"
                aria-label={t('nav.main')}
                gap={1}
                px={4}
                align="stretch"
              >
                {nav.map(([href, key]) => (
                  <NavLink
                    key={href}
                    href={href}
                    size="md"
                    justifyContent="flex-start"
                  >
                    {t(key)}
                  </NavLink>
                ))}

                {currentUser?.isAdmin && <AdminDropdown isMobile />}

                <Box pt={3} display="flex" justifyContent="center">
                  <AvatarButton />
                </Box>
              </VStack>
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>
    );
  }

  // The masthead (magazine pass): the name, search and the account on the
  // paper, then the sections between two ink rules.
  return (
    <VStack
      as="header"
      gap={0}
      width="100%"
      maxWidth={960}
      px={5}
      pt={4}
      // Stays put while the page changes (view transitions).
      css={{ viewTransitionName: 'site-header' }}
    >
      <HStack gap={5} width="100%" pb={3} alignItems="center">
        <Wordmark showTitle />

        <Box flex="1" maxW="420px" ml="auto">
          <SearchInput />
        </Box>

        <HStack gap={3} flexShrink={0}>
          {currentUser && <AddMenuButton />}
          {currentUser && <Bell />}
          <AvatarButton />
        </HStack>
      </HStack>
      <Box
        w="100%"
        py={1.5}
        borderTop="2px solid"
        borderBottom="2px solid"
        borderColor="ink"
      >
        <HStack as="nav" aria-label={t('nav.main')} gap={1} width="100%">
          {nav.map(([href, key]) => (
            <NavLink key={href} href={href}>
              {t(key)}
            </NavLink>
          ))}
          <Spacer />
          {currentUser?.isAdmin && <AdminDropdown />}
        </HStack>
      </Box>
    </VStack>
  );
};

export default Navigation;
