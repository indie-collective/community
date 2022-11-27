import { Alert, AlertIcon, Box, Heading } from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useActionData, useTransition } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import ForgotForm from '../components/ForgotForm';
import { sendEmail } from '../utils/email.server';

const port = process.env.PORT ?? 3000;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${port}`;

export const loader = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
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

    // send reset email
    await sendEmail({
      to: email,
      subject: 'IndieCo Community password reset',
      text: `We've received a password reset request for this email. If this was your request, you can reset by following this link: ${BASE_URL}/reset/${token.token}. If not, please contact us so we can secure your account.`,
      html: `<p>We've received a password reset request for this email.</p><p>If this was your request, you can reset by following <a href="${BASE_URL}/reset/${token.token}">this link</a>.<p><p>If not, please contact us so we can secure your account.</p>`,
    });
  }

  return json({ reset: true });
};

export const meta = () => ({
  title: 'Forgot password',
});

const SignUp = () => {
  const transition = useTransition();
  const actionData = useActionData();

  if (actionData && actionData.reset) {
    return (
      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold" mb={6}>
          Forgot password
        </Heading>

        <Alert status="success">
          <AlertIcon />
          If we found that email, we've sent it a reset link.
        </Alert>
      </Box>
    );
  }

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold" mb={6}>
        Forgot password
      </Heading>

      {actionData?.error && (
        <Alert status="error" mb="10px">
          <AlertIcon />
          {actionData?.error}
        </Alert>
      )}

      <ForgotForm method="post" loading={transition.state === 'submitting'} />
    </Box>
  );
};

export default SignUp;
