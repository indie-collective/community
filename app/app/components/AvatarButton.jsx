import { Button, Avatar } from '@chakra-ui/react';
import { Link, useLoaderData } from '@remix-run/react';

const AvatarButton = () => {
  const data = useLoaderData();

  if (data?.currentUser) {
    const { first_name, avatar } = data.currentUser;

    return (
      <Link to="/profile">
        <Avatar size="sm" name={first_name} ml={5} src={avatar} />
      </Link>
    );
  }

  return (
    <Button
      as={Link}
      to="/signin"
      ml={2}
      colorScheme="teal"
      aria-label="Signin"
      variant="ghost"
    >
      🔑
    </Button>
  );
};

export default AvatarButton;
