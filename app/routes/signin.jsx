import {
  Alert,
  Box,
  Button,
  Heading,
  HStack,
  Stack,
  Text,
  VisuallyHidden,
  Separator,
} from '@chakra-ui/react';

import { Form, redirect, useActionData, useNavigation } from 'react-router';
import { SocialsProvider } from 'remix-auth-socials';
import { FaDiscord } from 'react-icons/fa6';

import { authenticator } from '../utils/auth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { commitSession, getSession } from '../utils/session.server';
import SigninForm from '../components/SigninForm';

export let loader = async ({ request }) => {
  const user = await isAuthenticated(request);

  if (user) return redirect('/');
};

export let action = async ({ request }) => {
  try {
    const user = await authenticator.authenticate('user-pass', request);

    const session = await getSession(request.headers.get('cookie'));

    session.set('user', user);

    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    throw error;
  }
};

export const meta = () => [
  {
    title: 'Sign In',
  },
];

const SignIn = () => {
  const navigation = useNavigation();
  const actionData = useActionData();

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in
      </Heading>
      <Form action={`/auth/${SocialsProvider.DISCORD}`} method="post">
        <Button
          type="submit"
          colorPalette={SocialsProvider.DISCORD}
          aria-label="Signin"
          w="100%"
        >
          Sign in with<VisuallyHidden> Discord</VisuallyHidden>
          <FaDiscord boxSize="5" />
        </Button>
      </Form>
      {process.env.NODE_ENV === 'development' && (
        <Stack gap={5}>
          <HStack>
            <Separator />
            <Text fontSize="sm" whiteSpace="nowrap" color="muted">
              or continue with
            </Text>
            <Separator />
          </HStack>
          {actionData?.error && (
            <Alert.Root status="error" mb="10px">
              <Alert.Indicator />
              {actionData?.error}
            </Alert.Root>
          )}

          <SigninForm loading={navigation.state === 'submitting'} />
        </Stack>
      )}
    </Box>
  );
};

export default SignIn;
