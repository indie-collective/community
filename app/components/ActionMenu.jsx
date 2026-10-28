import { Button, HStack, IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuCopy, LuEllipsis, LuPencil, LuTrash2 } from 'react-icons/lu';
import Link from './Link';
import { useT } from '../i18n';

/**
 * A record page's actions for members (design pass): Edit, in plain sight,
 * and in a "More actions" menu, Report a duplicate (#346) and Delete, for
 * admins only (#309). The same on game, organisation and event pages.
 *
 * v3 idioms: asChild on the trigger (without it the IconButton was a
 * <button> nested in the trigger's <button>), items rendered as router
 * links through asChild, and icons as children.
 */
const ActionMenu = ({ editLink, onDelete, onReportDuplicate, ...props }) => {
  const t = useT();
  return (
  <HStack gap={1} {...props}>
    {editLink && (
      <Button asChild size="sm" variant="outline">
        <Link to={editLink}>
          <LuPencil />
          {t('actions.edit')}
        </Link>
      </Button>
    )}
    {(onDelete || onReportDuplicate) && (
      <Menu.Root positioning={{ placement: 'bottom-end' }}>
        <Menu.Trigger asChild>
          <IconButton
            aria-label={t('actions.more')}
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
              {onReportDuplicate && (
                <Menu.Item value="duplicate" onSelect={onReportDuplicate}>
                  <LuCopy />
                  {t('actions.duplicate')}
                </Menu.Item>
              )}
              {onReportDuplicate && onDelete && <Menu.Separator />}
              {onDelete && (
                <Menu.Item value="delete" color="fg.error" onSelect={onDelete}>
                  <LuTrash2 />
                  {t('actions.delete')}
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    )}
  </HStack>
  );
};

export default ActionMenu;
