import { Button, Avatar } from '@chakra-ui/react';
import { Link } from '@remix-run/react';

const AvatarButton = () => {
  const currentPerson = false;

  if (currentPerson) {
    const { fullName, avatar } = currentPerson;

    return (
      <Link to="/profile">
        <a>
          <Avatar size="sm" name={fullName} ml={5} src={avatar && avatar.url} />
        </a>
      </Link>
    );
  }

  return (
    <Link to="/signin">
      <Button ml={2} colorScheme="teal" aria-label="Signin" variant="ghost">
        🔑
      </Button>
    </Link>
  );
};

export default AvatarButton;
