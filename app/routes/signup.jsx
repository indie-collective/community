import {
  Alert,
  Box,
  Heading,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useTransition } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import { commitSession, getSession } from '../utils/session.server';
import SignupForm from '../components/SignupForm';

export const loader = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
};

export const action = async ({ request }) => {
  try {
    const form = await request.formData();

    const firstName = form.get('firstName');
    const lastName = form.get('lastName');
    const email = form.get('email');
    const password = form.get('password');
    const confirm = form.get('passwordConfirmation');

    if (password !== confirm) {
      return json({
        error: "Password and confirmation don't match",
      });
    }

    const user = await db.person.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
    });

    await db.$queryRaw`update person set password_hash = public.crypt(${password}, public.gen_salt('bf')) where email = ${user.email}`;

    let session = await getSession(request.headers.get('cookie'));

    session.set(authenticator.sessionKey, user);

    return redirect('/welcome', {
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
      error: 'An error occured.',
    });
  }
};

export const meta = () => ({
  title: 'Sign Up',
});

const SignUp = () => {
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Join the club!
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Already have an account? </Text>
        <ChakraLink
          as={Link}
          to="/signin"
          color={'teal.600'}
          fontWeight="semibold"
        >
          Sign in
        </ChakraLink>
      </Text>

      {actionData?.error && (
        <Alert status="error" mb="10px">
          {actionData?.error}
        </Alert>
      )}

      <SignupForm method="post" loading={transition.state === 'submitting'} />
    </Box>
  );
};

export default SignUp;
