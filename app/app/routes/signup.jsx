import {
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  useColorModeValue as mode,
  useToast,
} from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import { commitSession, getSession } from '../utils/session.server';
import Navigation from '../components/Navigation';
import SignupForm from '../components/SignupForm';

export const loader = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
};

export const action = async ({ request }) => {
  try {
    const form = await request.formData();

    const user = await db.person.create({
      data: {
        first_name: form.get('firstName'),
        last_name: form.get('lastName'),
        email: form.get('email'),
      },
    });

    await db.$queryRaw`update indieco.person set password_hash = public.crypt(${form.get(
      'password'
    )}, public.gen_salt('bf')) where email = ${user.email}`;

    let session = await getSession(request.headers.get('cookie'));

    session.set(authenticator.sessionKey, user);

    return redirect('/', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    console.log(error);

    if (error.code === 'P2002') {
      return json({
        error: 'This email is already registered',
      });
    }

    return json({
      error: error.message,
    });
  }
};

export const meta = () => ({
  title: 'Sign Up',
});

const SignUp = () => {
  const toast = useToast({
    position: 'bottom-right',
  });
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
    <Box>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Join the club!
        </Heading>
        <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
          <Text as="span">Already have an account? </Text>
          <ChakraLink
            as={Link}
            to="/signin"
            color={mode('teal.600', 'teal.200')}
            fontWeight="semibold"
          >
            Sign in
          </ChakraLink>
        </Text>

        <SignupForm method="post" loading={transition.state === 'submitting'} />
      </Box>
    </Box>
  );
};

export default SignUp;
