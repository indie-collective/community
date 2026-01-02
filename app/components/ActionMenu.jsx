import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    MenuDivider,
} from '@chakra-ui/react';
import {
    EditIcon,
    TimeIcon,
    DeleteIcon,
    SettingsIcon
} from '@chakra-ui/icons';
import { Link } from '@remix-run/react';

const ActionMenu = ({ editLink, changesLink, onDelete, ...props }) => {
    return (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<SettingsIcon />}
                variant="ghost"
                colorScheme="gray"
                borderRadius="full"
                {...props}
            />
            <MenuList>
                {editLink && (
                    <MenuItem as={Link} to={editLink} icon={<EditIcon />}>
                        Edit
                    </MenuItem>
                )}
                {changesLink && (
                    <MenuItem as={Link} to={changesLink} icon={<TimeIcon />}>
                        History
                    </MenuItem>
                )}
                {onDelete && (
                    <>
                        <MenuDivider />
                        <MenuItem
                            icon={<DeleteIcon />}
                            color="red.500"
                            onClick={onDelete}
                        >
                            Delete
                        </MenuItem>
                    </>
                )}
            </MenuList>
        </Menu>
    );
};

export default ActionMenu;
