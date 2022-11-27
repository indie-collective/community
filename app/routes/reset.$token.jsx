import {
  Alert,
  AlertIcon,
  Box,
  Heading,
  Text,
  Link as ChakraLink,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useTransition } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import { commitSession, getSession } from '../utils/session.server';
import PasswordResetForm from '../components/PasswordResetForm';

export const loader = async ({ request, params }) => {
  const { token } = params;

  const resetToken = await db.reset_token.findFirst({
    where: {
      token,
    },
    include: {
      person: true,
    },
  });

  if (!resetToken) {
    return redirect('/');
  }

  return null;
};

export const action = async ({ request, params }) => {
  try {
    const form = await request.formData();

    const password = form.get('password');
    const confirm = form.get('passwordConfirmation');

    if (password !== confirm) {
      return json({
        error: "Password and confirmation don't match",
      });
    }

    const resetToken = await db.reset_token.findFirst({
      where: {
        token,
      },
      include: {
        person: true,
      },
    });
  
    await db.$queryRaw`update indieco.person set password_hash = public.crypt(${password}, public.gen_salt('bf')) where email = ${resetToken.person.email}`;

    return redirect('/welcome', {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    console.log(error);

    return json({
      error: 'An error occured.',
    });
  }
};

export const meta = () => ({
  title: 'Reset password',
});

const Reset = () => {
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold" mb={6}>
        Reset password
      </Heading>

      {actionData?.error && (
        <Alert status="error" mb="10px">
          <AlertIcon />
          {actionData?.error}
        </Alert>
      )}

      <PasswordResetForm
        method="post"
        loading={transition.state === 'submitting'}
      />
    </Box>
  );
};

export default Reset;
