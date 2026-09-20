import { Alert, Box, Heading } from '@chakra-ui/react';

import { redirect, useActionData, useNavigation } from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server'
import ForgotForm from '../components/ForgotForm';
import { sendEmail } from '../utils/email.server';

export const loader = async ({ request }) => {
  // Signed-in users have no business on the password-reset page.
  // This was `{ successRedirect: '/' }` under remix-auth v3; the current
  // helper takes a boolean `required`, so the redirect is expressed here.
  const currentUser = await isAuthenticated(request);

  if (currentUser) throw redirect('/');

  return null;
};

export const action = async ({ request }) => {
  const form = await request.formData();

  const email = form.get('email');

  const person = await db.person.findUnique({
    where: {
      email,
    },
  });

  if (person) {
    // create reset token
    const token = await db.reset_token.create({
      data: {
        person_id: person.id,
      },
    });

    const port = process.env.PORT ?? 3000;
    const BASE_URL = process.env.BASE_URL ?? `http://localhost:${port}`;

    // send reset email
    await sendEmail({
      to: email,
      subject: 'IndieCo Community password reset',
      text: `We've received a password reset request for this email. If this was your request, you can reset by following this link: ${BASE_URL}/reset/${token.token}. If not, please contact us so we can secure your account.`,
      html: `<p>We've received a password reset request for this email.</p><p>If this was your request, you can reset by following <a href="${BASE_URL}/reset/${token.token}">this link</a>.<p><p>If not, please contact us so we can secure your account.</p>`,
    });
  }

  return { reset: true };
};

export const meta = () => [{
  title: 'Forgot password'
}];

const SignUp = () => {
  const navigation = useNavigation();
  const actionData = useActionData();

  if (actionData && actionData.reset) {
    return (
      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold" mb={6}>
          Forgot password
        </Heading>
        <Alert.Root status="success">
          <Alert.Indicator />
          If we found that email, we've sent it a reset link.
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold" mb={6}>
        Forgot password
      </Heading>
      {actionData?.error && (
        <Alert.Root status="error" mb="10px">
          <Alert.Indicator />
          {actionData?.error}
        </Alert.Root>
      )}
      <ForgotForm method="post" loading={navigation.state === 'submitting'} />
    </Box>
  );
};

export default SignUp;
