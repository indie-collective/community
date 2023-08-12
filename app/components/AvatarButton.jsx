import {
  chakra,
  HStack,
  Flex,
  Text,
  Button,
  Avatar,
  VisuallyHidden,
} from '@chakra-ui/react';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { SocialsProvider } from 'remix-auth-socials';

import { DiscordIcon } from './DiscordIcon';

const AvatarButton = () => {
  const data = useLoaderData();

  if (data?.currentUser) {
    const { first_name, username, avatar } = data.currentUser;

    return (
      <Link to="/profile">
        <HStack spacing="1.5">
          <Avatar size="md" name={first_name} src={avatar} />
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
    <chakra.form
      as={Form}
      action={`/auth/${SocialsProvider.DISCORD}`}
      method="post"
    >
      <Button
        type="submit"
        colorScheme={SocialsProvider.DISCORD}
        aria-label="Signin"
        rightIcon={<DiscordIcon boxSize="5" />}
        w="100%"
      >
        Sign in with<VisuallyHidden> Discord</VisuallyHidden>
      </Button>
    </chakra.form>
  );
};

export default AvatarButton;
