import { Button, Avatar } from '@chakra-ui/react';
import Link from 'next/link';

import useCurrentPerson from '../hooks/useCurrentPerson';

const AvatarButton = () => {
  const currentPerson = useCurrentPerson();

  if (currentPerson) {
    const { fullName, avatar } = currentPerson;

    return (
      <Link href="/profile">
        <a>
          <Avatar size="sm" name={fullName} ml={5} src={avatar} />
        </a>
      </Link>
    );
  }

  return (
    <Button
      as="a"
      ml={5}
      colorScheme="teal"
      variant="ghost"
      aria-label="Signin"
      href="/api/auth/login"
    >
      Sign in
    </Button>
  );
};

export default AvatarButton;
