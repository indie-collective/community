import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Link } from '@remix-run/react';

const AddMenuButton = () => (
  <Menu>
    <MenuButton
      as={IconButton}
      icon={<AddIcon w={6} h={6} />}
      size="lg"
      colorScheme="teal"
      variant="solid"
      aria-label="Add new"
    />
    <MenuList>
      <MenuItem as={Link} to="/games/create">
        Add game
      </MenuItem>
      <MenuItem as={Link} to="/events/create">
        Add event
      </MenuItem>
      <MenuItem as={Link} to="/orgs/create">
        Add organisation
      </MenuItem>
    </MenuList>
  </Menu>
);

export default AddMenuButton;
