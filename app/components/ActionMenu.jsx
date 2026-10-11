import { Button, HStack, IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuEllipsis, LuPencil, LuTimer, LuTrash2 } from 'react-icons/lu';
import { Link } from 'react-router';

/**
 * A record page's actions for members (design pass): Edit, in plain sight,
 * and the rarer ones (History, Delete) in a "More actions" menu. The same on
 * game, organisation and event pages.
 *
 * v3 idioms: asChild on the trigger (without it the IconButton was a
 * <button> nested in the trigger's <button>), items rendered as router
 * links through asChild, and icons as children.
 */
const ActionMenu = ({ editLink, changesLink, onDelete, ...props }) => (
  <HStack gap={1} {...props}>
    {editLink && (
      <Button asChild size="sm" variant="outline">
        <Link to={editLink}>
          <LuPencil />
          Edit
        </Link>
      </Button>
    )}
    {(changesLink || onDelete) && (
      <Menu.Root positioning={{ placement: 'bottom-end' }}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="More actions"
            size="sm"
            variant="ghost"
            colorPalette="gray"
          >
            <LuEllipsis />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {changesLink && (
                <Menu.Item value="history" asChild>
                  <Link to={changesLink}>
                    <LuTimer />
                    History
                  </Link>
                </Menu.Item>
              )}
              {changesLink && onDelete && <Menu.Separator />}
              {onDelete && (
                <Menu.Item value="delete" color="fg.error" onSelect={onDelete}>
                  <LuTrash2 />
                  Delete
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    )}
  </HStack>
);

export default ActionMenu;
