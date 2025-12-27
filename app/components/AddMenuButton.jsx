import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from '@remix-run/react';

const AddMenuButton = () => {
  const navigate = useNavigate();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<AddIcon w={6} h={6} />}
        size="lg"
        colorScheme="green"
        variant="solid"
        aria-label="Add new"
      />
      <MenuList>
        <MenuItem as={ChakraLink} href="games/create" _hover={{ textDecor: 'none' }}>
          Add game
        </MenuItem>
        <MenuItem as={ChakraLink} href="/events/create" _hover={{ textDecor: 'none' }}>
          Add event
        </MenuItem>
        <MenuItem as={ChakraLink} href="/orgs/create" _hover={{ textDecor: 'none' }}>
          Add organisation
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AddMenuButton;
