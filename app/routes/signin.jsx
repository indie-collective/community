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
  Icon,
  Field,
  Input,
} from '@chakra-ui/react';

import { Form, redirect, useActionData, useLoaderData, useNavigation, useSearchParams } from 'react-router';
import { SocialsProvider } from 'remix-auth-socials';
import { FaBluesky, FaDiscord } from 'react-icons/fa6';

import { authenticator } from '../utils/auth.server';
import { devSignIn } from '../utils/devSignIn.server';
import { createBlueskyClient } from '../utils/bluesky/oauth.server';
import getOrigin from '../utils/origin.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { commitSession, getSession } from '../utils/session.server';
import toSessionUser from '../utils/sessionUser.server';
import SigninForm from '../components/SigninForm';
import { safeRedirectPath } from '../utils/safeRedirect';
import { pageMeta } from '../utils/meta';

// Where to go after signing in: the page that required it (#178).
const prevOf = (request) => safeRedirectPath(new URL(request.url).searchParams.get('prev'));

export let loader = async ({ request }) => {
  const user = await isAuthenticated(request);

  if (user) return redirect(prevOf(request));
  return { devSignIn: devSignIn() };
};

// Starts a Bluesky sign-in (#157): to the account's authorization server,
// found from the handle, or to bsky.social's when none is given.
async function startBlueskySignIn(request, form) {
  const handle = String(form.get('handle') ?? '')
    .trim()
    .replace(/^@/, '');
  try {
    const url = await createBlueskyClient(getOrigin(request)).authorize(
      handle || 'https://bsky.social',
      { state: prevOf(request) }
    );
    return redirect(url.href);
  } catch (error) {
    console.error('Bluesky sign-in failed to start:', error);
    return {
      blueskyError: handle
        ? `We couldn't find the Bluesky account “${handle}”. Check the handle and try again.`
        : 'Bluesky is unreachable right now. Please try again.',
    };
  }
}

export let action = async ({ request }) => {
  const form = await request.clone().formData();
  if (form.get('intent') === 'bluesky') return startBlueskySignIn(request, form);

  try {
    const user = await authenticator.authenticate('user-pass', request);

    const session = await getSession(request.headers.get('cookie'));

    session.set('user', toSessionUser(user));

    return redirect(prevOf(request), {
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

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Sign In',
    path: location.pathname,
  });

const SignIn = () => {
  const navigation = useNavigation();
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const [searchParams] = useSearchParams();
  const prev = searchParams.get('prev');

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading textAlign="center" size="xl" fontWeight="extrabold">
        Sign in
      </Heading>
      {(actionData?.blueskyError || searchParams.get('error')) && (
        <Alert.Root status="error" mt={5}>
          <Alert.Indicator />
          {actionData?.blueskyError ?? searchParams.get('error')}
        </Alert.Root>
      )}
      <Form method="post" replace>
        <input type="hidden" name="intent" value="bluesky" />
        <Stack gap={2} mt={5} mb={3}>
          <Field.Root>
            <Field.Label>Your Bluesky handle</Field.Label>
            <Input
              name="handle"
              placeholder="yourname.bsky.social"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
            <Field.HelperText>
              Leave it empty to choose your account on bsky.social.
            </Field.HelperText>
          </Field.Root>
          <Button
            type="submit"
            colorPalette="blue"
            w="100%"
            loading={
              navigation.state === 'submitting' &&
              navigation.formData?.get('intent') === 'bluesky'
            }
          >
            Sign in with Bluesky
            <Icon boxSize="5">
              <FaBluesky />
            </Icon>
          </Button>
        </Stack>
      </Form>
      <Form action={`/auth/${SocialsProvider.DISCORD}`} method="post">
        {prev && <input type="hidden" name="prev" value={prev} />}
        <Button
          type="submit"
          colorPalette={SocialsProvider.DISCORD}
          aria-label="Signin"
          w="100%"
        >
          Sign in with<VisuallyHidden> Discord</VisuallyHidden>
          <Icon boxSize="5">
            <FaDiscord />
          </Icon>
        </Button>
      </Form>
      {loaderData?.devSignIn && (
        <Stack gap={5}>
          <HStack>
            <Separator flex="1" borderColor={{ base: 'gray.300', _dark: 'gray.600' }} />
            <Text fontSize="sm" whiteSpace="nowrap" color="muted">
              or continue with
            </Text>
            <Separator flex="1" borderColor={{ base: 'gray.300', _dark: 'gray.600' }} />
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
