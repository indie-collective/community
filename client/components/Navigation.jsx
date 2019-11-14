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
import { useRouter } from 'next/dist/client/router';

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
    <Flex>
      <Link href="/">
        <Button
          variantColor="green"
          variant="ghost"
          m="10px"
          isActive={pathname === '/'}
        >
          IndieCo
        </Button>
      </Link>

      <ButtonGroup p="10px">
        <Link href="/games">
          <Button
            variantColor="blue"
            variant="ghost"
            isActive={pathname === '/games'}
          >
            Games
          </Button>
        </Link>

        <Link href="/orgs">
          <Button
            variantColor="blue"
            variant="ghost"
            isActive={pathname === '/orgs'}
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
