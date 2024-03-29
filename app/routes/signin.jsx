import {
  chakra,
  // Alert,
  // AlertIcon,
  Box,
  Button,
  // Divider,
  Heading,
  // HStack,
  // Link as ChakraLink,
  // Stack,
  Text,
  VisuallyHidden,
  // useColorModeValue as mode,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import {
  Form,
  // Link,
  // useActionData,
  // useSearchParams,
  // useTransition,
} from '@remix-run/react';
import { AuthorizationError } from 'remix-auth';
import { SocialsProvider } from 'remix-auth-socials';

import { authenticator } from '../utils/auth.server';
import { DiscordIcon } from '../components/DiscordIcon';
// import OAuthButtonGroup from '../components/OAuthButtonGroup';
// import SigninForm from '../components/SigninForm';

export let loader = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
};

export let action = async ({ request }) => {
  try {
    return await authenticator.authenticate('user-pass', request, {
      successRedirect: '/',
      throwOnError: true,
    });
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return json({ error: error.message });
    }

    console.log(error);
    return json({ error: 'Something went wrong' });
  }
};

export const meta = () => ({
  title: 'Sign In',
});

const SignIn = () => {
  // const transition = useTransition();
  // const actionData = useActionData();

  // const [searchParams] = useSearchParams();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in
      </Heading>

      <Text my={5}>
        To start contributing, connect with Discord and join Indie Collective's
        server to get write access to community.
      </Text>

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

      {/* <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Don&apos;t have an account? </Text>
        <ChakraLink
          as={Link}
          to="/signup"
          color={mode('teal.600', 'teal.200')}
          fontWeight="semibold"
        >
          Sign up
        </ChakraLink>
      </Text> */}

      {/* <Stack spacing={5}>
        {actionData?.error && (
          <Alert status="error" mb="10px">
            <AlertIcon />
            {actionData?.error}
          </Alert>
        )}

        <SigninForm loading={transition.status === 'submitting'} />

        {searchParams.has('beta') && (
          <>
            <HStack>
              <Divider />
              <Text fontSize="sm" whiteSpace="nowrap" color="muted">
                or continue with
              </Text>
              <Divider />
            </HStack>

            <OAuthButtonGroup />
          </>
        )}
      </Stack> */}
    </Box>
  );
};

export default SignIn;
