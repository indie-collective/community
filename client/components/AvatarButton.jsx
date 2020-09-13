import { Button, Avatar } from '@chakra-ui/core';
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
    <>
      <Link href="/signin">
        <Button
          ml={5}
          variantColor="teal"
          variant="ghost"
          aria-label="Signin"
        >
          Sign in
        </Button>
      </Link>
      <Link href="/signup">
        <Button
          ml={5}
          variantColor="teal"
          aria-label="Signup"
        >
          Sign up
        </Button>
      </Link>
    </>
  );
};

export default AvatarButton;
