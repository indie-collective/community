import {
  Alert,
  AlertIcon,
  Box,
  Button,
  chakra,
  Divider,
  Heading,
  HStack,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { AuthorizationError } from 'remix-auth';
import { SocialsProvider } from 'remix-auth-socials';

import { authenticator } from '../utils/auth.server';
import { DiscordIcon } from '../components/DiscordIcon';
import SigninForm from '../components/SigninForm';

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
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in
      </Heading>

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
      {process.env.NODE_ENV === 'development' && (
        <Stack spacing={5}>
          <HStack>
            <Divider />
            <Text fontSize="sm" whiteSpace="nowrap" color="muted">
              or continue with
            </Text>
            <Divider />
          </HStack>
          {actionData?.error && (
            <Alert status="error" mb="10px">
              <AlertIcon />
              {actionData?.error}
            </Alert>
          )}

          <SigninForm loading={transition.state === 'submitting'} />
        </Stack>
      )}
    </Box>
  );
};

export default SignIn;
