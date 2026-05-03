import {
  HStack,
  Flex,
  Text,
  Button,
  Avatar,
  VisuallyHidden,
} from '@chakra-ui/react';
import { Form, Link, useLoaderData } from 'react-router';
import { SocialsProvider } from 'remix-auth-socials';

const AvatarButton = () => {
  const data = useLoaderData();

  if (data?.currentUser) {
    const { first_name, username, avatar } = data.currentUser;

    return (
      <Link to="/profile">
        <HStack gap="1.5" pr={3}>
          <Avatar.Root size="md">
            <Avatar.Fallback name={first_name} />
            <Avatar.Image src={avatar} />
          </Avatar.Root>
          <Flex direction="column">
            <Text fontWeight="bold" mb="-2px">
              {first_name}
            </Text>
            <Text fontSize="small">@{username}</Text>
          </Flex>
        </HStack>
      </Link>
    );
  }

  return (
    <Form action={`/auth/${SocialsProvider.DISCORD}`} method="post">
      <Button
        type="submit"
        colorPalette={SocialsProvider.DISCORD}
        aria-label="Signin"
        w="100%"
        size="lg"
        borderRadius="full"
      >
        Sign in
      </Button>
    </Form>
  );
};

export default AvatarButton;
