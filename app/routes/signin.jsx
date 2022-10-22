import {
  Box,
  Divider,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue as mode,
  useToast,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { Link, useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';
import { AuthorizationError } from 'remix-auth';

import { authenticator } from '../utils/auth.server';
import OAuthButtonGroup from '../components/OAuthButtonGroup';
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
  const toast = useToast();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    toast({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
    });
  }, [actionData?.error, transition.state === 'submitting', toast]);

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Don&apos;t have an account? </Text>
        <ChakraLink
          as={Link}
          to="/signup"
          color={mode('teal.600', 'teal.200')}
          fontWeight="semibold"
        >
          Sign up
        </ChakraLink>
      </Text>

      <Stack spacing={5}>
        <SigninForm loading={transition.status === 'submitting'} />

        <HStack>
          <Divider />
          <Text fontSize="sm" whiteSpace="nowrap" color="muted">
            or continue with
          </Text>
          <Divider />
        </HStack>

        <OAuthButtonGroup />
      </Stack>
    </Box>
  );
};

export default SignIn;