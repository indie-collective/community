import Link from 'next/link';
import {
  Box,
  Flex,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/core';
import { useRouter } from 'next/router';
import Logo from './Logo';

const CategoryMenu = () => (
  <Menu>
    <MenuButton as={Button} h="1.75rem" size="sm" rightIcon="chevron-down">
      All
    </MenuButton>
    <MenuList placement="auto-end">
      <MenuItem>Games</MenuItem>
      <MenuItem>Orgs</MenuItem>
      <MenuItem>Events</MenuItem>
    </MenuList>
  </Menu>
);

const SearchBar = () => {
  const [show, setShow] = React.useState(false);

  return (
    <InputGroup size="md">
      <Input pr="5rem" type="text" placeholder="Search" />
      <InputRightElement width="4rem" mr=".5em">
        <CategoryMenu />
      </InputRightElement>
    </InputGroup>
  );
};

const Navigation = () => {
  const { pathname } = useRouter();

  return (
    <Flex p="10px">
      <Link href="/">
        <a>
          <Logo />
        </a>
      </Link>

      <Box flex="auto" />

      <ButtonGroup>
        <Link href="/games">
          <Button
            variantColor="blue"
            variant="ghost"
            isActive={pathname === '/games'}
            mr={2}
          >
            Games
          </Button>
        </Link>

        <Link href="/orgs">
          <Button
            variantColor="blue"
            variant="ghost"
            isActive={pathname === '/orgs'}
            mr={2}
          >
            Orgs
          </Button>
        </Link>

        <Link href="/events">
          <Button
            variantColor="blue"
            variant="ghost"
            isActive={pathname === '/events'}
          >
            Events
          </Button>
        </Link>
      </ButtonGroup>

      <ButtonGroup p="10px" display="none">
        <Button variantColor="red" variant="ghost">
          Login
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

export default Navigation;
