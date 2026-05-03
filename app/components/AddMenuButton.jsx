import {
  Menu,
  IconButton,
  Link as ChakraLink,
  Portal,
  Icon,
} from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router';

const AddMenuButton = () => {
  const navigate = useNavigate();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          borderRadius="full"
          size="lg"
          colorPalette="green"
          variant="solid"
          aria-label="Add new"
        >
          <Icon as={LuPlus} w={6} h={6} />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-0" asChild>
              <ChakraLink href="games/create">Add game</ChakraLink>
            </Menu.Item>
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-1" asChild>
              <ChakraLink href="/events/create">Add event</ChakraLink>
            </Menu.Item>
            <Menu.Item _hover={{ textDecor: 'none' }} value="item-2" asChild>
              <ChakraLink href="/orgs/create">Add organisation</ChakraLink>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default AddMenuButton;
