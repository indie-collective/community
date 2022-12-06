import { LockIcon } from '@chakra-ui/icons';
import { HStack, Flex, Text, Button, Avatar } from '@chakra-ui/react';
import { Link, useLoaderData } from '@remix-run/react';

const AvatarButton = () => {
  const data = useLoaderData();

  if (data?.currentUser) {
    const { first_name, username, avatar } = data.currentUser;

    return (
      <Link to="/profile">
        <HStack spacing="1.5">
          <Avatar size="md" name={first_name} src={avatar} />
          <Flex direction="column">
            <Text fontWeight="bold" mb="-2px">{first_name}</Text>
            <Text fontSize="small">@{username}</Text>
          </Flex>
        </HStack>
      </Link>
    );
  }

  return (
    <Button
      as={Link}
      to="/signin"
      colorScheme="teal"
      aria-label="Signin"
      leftIcon={<LockIcon/>}
    >
      Sign in
    </Button>
  );
};

export default AvatarButton;
