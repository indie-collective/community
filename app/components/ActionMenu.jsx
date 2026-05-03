import { Menu, IconButton, Portal } from '@chakra-ui/react';
import { LuPencil, LuTimer, LuTrash2, LuSettings } from 'react-icons/lu';
import { Link } from 'react-router';

const ActionMenu = ({ editLink, changesLink, onDelete, ...props }) => {
  return (
    <Menu.Root>
      <Menu.Trigger>
        <IconButton
          aria-label="Options"
          variant="ghost"
          colorScheme="gray"
          borderRadius="full"
          {...props}
        >
          <LuSettings />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {editLink && (
              <Menu.Item
                as={Link}
                to={editLink}
                icon={<LuPencil />}
                value="item-0"
              >
                Edit
              </Menu.Item>
            )}
            {changesLink && (
              <Menu.Item
                as={Link}
                to={changesLink}
                icon={<LuTimer />}
                value="item-1"
              >
                History
              </Menu.Item>
            )}
            {onDelete && (
              <>
                <Menu.Separator />
                <Menu.Item
                  icon={<LuTrash2 />}
                  color="red.500"
                  onSelect={onDelete}
                  value="item-2"
                >
                  Delete
                </Menu.Item>
              </>
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default ActionMenu;
