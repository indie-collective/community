import { Alert, Box, Heading } from '@chakra-ui/react';
import { redirect, useActionData, useNavigation  } from 'react-router';

import { db } from '../utils/db.server';
import PasswordResetForm from '../components/PasswordResetForm';

export const loader = async ({ params }) => {
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
  const { token } = params;

  try {
    const form = await request.formData();

    const password = form.get('password');
    const confirm = form.get('passwordConfirmation');

    if (password !== confirm) {
      return {
        error: "Password and confirmation don't match",
      };
    }

    const resetToken = await db.reset_token.findFirst({
      where: {
        token,
      },
      include: {
        person: true,
      },
    });

    await db.$queryRaw`update person set password_hash = public.crypt(${password}, public.gen_salt('bf')) where email = ${resetToken.person.email}`;

    return redirect('/signin');
  } catch (error) {
    console.log(error);

    return {
      error: 'An error occured.',
    };
  }
};

export const meta = () => [{
  title: 'Reset password'
}];

const Reset = () => {
  const navigation = useNavigation();
  const actionData = useActionData();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold" mb={6}>
        Reset password
      </Heading>
      {actionData?.error && (
        <Alert.Root status="error" mb="10px">
          <Alert.Indicator />
          {actionData?.error}
        </Alert.Root>
      )}
      <PasswordResetForm
        method="post"
        loading={navigation.state === 'submitting'}
      />
    </Box>
  );
};

export default Reset;
