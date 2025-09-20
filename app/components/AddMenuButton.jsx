import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
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
        colorScheme="teal"
        variant="solid"
        aria-label="Add new"
      />
      <MenuList>
        <MenuItem onClick={() => navigate('/games/create')}>Add game</MenuItem>
        <MenuItem onClick={() => navigate('/events/create')}>Add event</MenuItem>
        <MenuItem onClick={() => navigate('/orgs/create')}>
          Add organisation
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AddMenuButton;
