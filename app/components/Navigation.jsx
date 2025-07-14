import {
  Box,
  Flex,
  HStack,
  Text,
  Link as ChakraLink,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Wrap,
  WrapItem,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { Link, useLoaderData, useLocation } from '@remix-run/react';
import { useColorModeValue } from '../components/ui/color-mode';

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
      color={'gray.500'}
      px="10px"
      py="5px"
      backgroundColor="transparent"
      _hover={{
        backgroundColor: 'gray.400',
        color: 'white',
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
  const background = 'white';

  // const adminSectionBgColor = useColorModeValue('gray.200', 'gray.900');

  const { currentUser } = useLoaderData();

  if (variant === 'mobile') {
    return (
      <>
        <HStack
          spacing={3}
          background={background}
          shadow="sm"
          width="100vw"
          px={4}
          py={2}
          justifyContent="space-between"
        >
          <Link to="/">
            <HStack as="span" spacing="2">
              <Logo />
              <VisuallyHidden>Community</VisuallyHidden>
            </HStack>
          </Link>

          <Box flex="auto">
            <SearchInput defaultValue={search} />
          </Box>

          <IconButton ml={2} icon={<FiMenu />} onClick={onToggle} />
        </HStack>

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
          <Wrap as="nav" spacing={4} my="10px" justify="center">
            <WrapItem>
              <NavLink href="/admin/users">Users</NavLink>
              <NavLink href="/admin/changes">Changes</NavLink>
              <NavLink href="/admin/missing">Missing</NavLink>
            </WrapItem>
          </Wrap>
        )}

        <Wrap as="nav" spacing={4} justify="center">
          <WrapItem>
            <AvatarButton />
          </WrapItem>
        </Wrap>
      </>
    );
  }

  return (
    <Flex justifyContent="center" mt={5}>
      <HStack spacing={3} py={2} px={5} maxWidth={960} width="100%" alignItems="flex-end">
        <Link to="/">
          <Logo height="48px" />
          <VisuallyHidden>Community</VisuallyHidden>
        </Link>

        <Box flex="auto">
        <SearchInput defaultValue={search} />
        </Box>

        {/* <Box as="nav" flex="auto">
          <HStack as="ul" spacing={1} my={5} alignItems="stretch">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/games">Games</NavLink>
            <NavLink href="/studios">Studios</NavLink>
            <NavLink href="/associations">Associations</NavLink>
            <NavLink href="/events">Events</NavLink>
          </HStack>

          {currentUser?.isAdmin && (
            <Box bg={adminSectionBgColor} p={1} borderRadius="md">
              <Text fontWeight="bold" color="gray.500" px={1} mb={3}>
                Admin
              </Text>
              <HStack as="ul" spacing={1} alignItems="stretch">
                <NavLink href="/admin/users">Users</NavLink>
                <NavLink href="/admin/changes">Changes</NavLink>
                <NavLink href="/admin/missing">Missing</NavLink>
              </HStack>
            </Box>
          )}
        </Box> */}

        <AvatarButton />
      </HStack>
    </Flex>
  );
};

export default Navigation;
