import {
  Menu,
  IconButton,
  Link as ChakraLink,
  Portal,
  Icon,
} from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useLocation } from 'react-router';
import { useT } from '../i18n';

// On a studios or associations list, a new organisation starts as that type (#86).
const ORG_TYPE_BY_PATH = { '/studios': 'studio', '/associations': 'association' };

const AddMenuButton = () => {
  const { pathname } = useLocation();
  const orgType = ORG_TYPE_BY_PATH[pathname];
  const t = useT();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          borderRadius="full"
          size="lg"
          colorPalette="green"
          variant="solid"
          aria-label={t('nav.addNew')}
        >
          <Icon as={LuPlus} w={6} h={6} />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-0" asChild>
              <ChakraLink href="/games/create">{t('add.game')}</ChakraLink>
            </Menu.Item>
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-1" asChild>
              <ChakraLink href="/events/create">{t('add.event')}</ChakraLink>
            </Menu.Item>
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-2" asChild>
              <ChakraLink href={orgType ? `/orgs/create?type=${orgType}` : '/orgs/create'}>{t('add.organization')}</ChakraLink>
            </Menu.Item>
            <Menu.Separator />
            {/* #339: or fill in what's missing. */}
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-3" asChild>
              <ChakraLink href="/missions">{t('add.missions')}</ChakraLink>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default AddMenuButton;
