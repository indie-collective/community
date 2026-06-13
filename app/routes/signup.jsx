import {
  Alert,
  Box,
  Heading,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useColorModeValue as mode } from '../components/ui/color-mode';
import { redirect, Link, useActionData, useNavigation  } from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { commitSession, getSession } from '../utils/session.server';
import SignupForm from '../components/SignupForm';

export const loader = async ({ request }) => {
  const user = await isAuthenticated(request);

  if (user) return redirect('/');
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
      return {
        error: "Password and confirmation don't match",
      };
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

    session.set('user', user);

    return redirect('/welcome', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return {
        error: 'This email is already registered',
      };
    }

    throw error;
  }
};

export const meta = () => [
  {
    title: 'Sign Up',
  },
];

const SignUp = () => {
  const navigation = useNavigation();
  const actionData = useActionData();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Join the club!
      </Heading>
      <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
        <Text as="span">Already have an account? </Text>
        <ChakraLink
          color={mode('teal.600', 'teal.200')}
          fontWeight="semibold"
          asChild
        >
          <Link to="/signin">Sign in</Link>
        </ChakraLink>
      </Text>
      {actionData?.error && (
        <Alert.Root status="error" mb="10px">
          <Alert.Indicator />
          {actionData?.error}
        </Alert.Root>
      )}
      <SignupForm method="post" loading={navigation.state === 'submitting'} />
    </Box>
  );
};

export default SignUp;
