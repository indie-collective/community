import { Menu, IconButton, Portal } from '@chakra-ui/react';
import { LuPencil, LuTimer, LuTrash2, LuSettings } from 'react-icons/lu';
import { Link } from 'react-router';

// v3 idioms throughout: asChild on the trigger (without it the IconButton was
// a <button> nested in the trigger's <button>), items rendered as router links
// through asChild, and icons as children rather than v2's `icon` prop.
const ActionMenu = ({ editLink, changesLink, onDelete, ...props }) => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          aria-label="Options"
          variant="ghost"
          colorPalette="gray"
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
              <Menu.Item value="edit" asChild>
                <Link to={editLink}>
                  <LuPencil />
                  Edit
                </Link>
              </Menu.Item>
            )}
            {changesLink && (
              <Menu.Item value="history" asChild>
                <Link to={changesLink}>
                  <LuTimer />
                  History
                </Link>
              </Menu.Item>
            )}
            {onDelete && (
              <>
                <Menu.Separator />
                <Menu.Item value="delete" color="red.500" onSelect={onDelete}>
                  <LuTrash2 />
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
