import { IconButton, Avatar } from '@chakra-ui/core';
import Link from 'next/link';

import useCurrentPerson from '../hooks/useCurrentPerson';

const AvatarButton = () => {
  const currentPerson = useCurrentPerson();

  if (currentPerson) {
    const { fullName, avatar } = currentPerson;

    return (
      <Link href="/profile">
        <a>
          <Avatar size="sm" name={fullName} ml={5} src={avatar && avatar.url} />
        </a>
      </Link>
    );
  }

  return (
    <Link href="/signin">
      <IconButton
        ml={5}
        variantColor="teal"
        aria-label="Signin"
        size="sm"
        icon="chevron-right"
        variant="ghost"
      />
    </Link>
  );
};

export default AvatarButton;
