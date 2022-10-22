import { EditIcon, ExternalLinkIcon, StarIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link as ChakraLink,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from '@remix-run/react';

import { authenticator } from '../utils/auth.server';
import { db } from '../utils/db.server';
import { commitSession, getSession } from '../utils/session.server';
import { DiscordIcon } from '../components/DiscordIcon';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  return { currentUser };
};

export async function action({ request }) {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!currentUser) {
    return redirect('/login');
  }

  const formData = await request.formData();

  try {
    const email = formData.get('email');

    await db.person.update({
      where: {
        id: currentUser.id,
      },
      data: {
        email,
      },
    });

    const updatedUser = {
      ...currentUser,
      email,
    };

    // manually get the session
    let session = await getSession(request.headers.get('cookie'));
    // and store the new email in the session data
    session.set(authenticator.sessionKey, updatedUser);

    // commit the session
    let headers = new Headers({ 'Set-Cookie': await commitSession(session) });

    return json({ currentUser: updatedUser }, { headers });
  } catch (error) {
    const values = Object.fromEntries(formData);
    return json({
      errors: {
        email:
          "This email can't be chosen. If you already registered with this email, either choose a different one or sign in to link your account.",
      },
      values,
    });
  }
}

export default function Welcome() {
  const { currentUser } = useLoaderData();
  const actionData = useActionData();

  const transition = useTransition();

  if ((!actionData && !currentUser.email) || actionData?.errors) {
    return (
      <Box p={5} mb={5}>
        <Box p={20} textAlign="center">
          <Heading as="h2" size="2xl" mb={5}>
            You're almost there!
          </Heading>
          <Text fontSize="xl">
            We just need a little more information to get you started.
          </Text>
        </Box>

        <Box maxWidth="lg" m="auto">
          <Form method="post">
            <FormControl mb={5} isInvalid={actionData?.errors.email} isRequired>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="test@example.com"
                defaultValue={actionData?.values.email}
              />
              <FormErrorMessage>{actionData?.errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl mb={10} isRequired>
              <Checkbox>
                I agree with to give my soul to Indie Collective
              </Checkbox>
            </FormControl>

            <Button
              type="submit"
              width="100%"
              isLoading={transition.state === 'submitting'}
            >
              Submit
            </Button>
          </Form>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={5} mb={5} textAlign="center">
      <Box p={20}>
        <Heading as="h2" size="2xl" mb={5}>
          Welcome to Community!
        </Heading>
        <Text fontSize="xl">Here's what you can do now</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} columnGap={8} rowGap={16}>
        <Box>
          <StarIcon boxSize={10} mb={5} />
          <Heading as="h3" size="md" mb={5}>
            Personalize your profile
          </Heading>
          <Text mb={2}>
            Personalize your dashboard through services integrations and
            fine-tune your research.
          </Text>
          <Button as={Link} to="/profile">
            Go to Profile
          </Button>
        </Box>

        <Box>
          <DiscordIcon boxSize={10} mb={5} />
          <Heading as="h3" size="md" mb={5}>
            Questions? Need help?
          </Heading>
          <Text mb={2}>
            Let's have a chat about Community! And special features for Indie
            Collective's members.
          </Text>
          <Button
            as={ChakraLink}
            href="https://discord.gg/KxZVu2ZZYs"
            isExternal
            style={{ textDecoration: 'none' }}
            textDecoration="none"
            rightIcon={<ExternalLinkIcon />}
          >
            Check our Discord
          </Button>
        </Box>

        <Box>
          <EditIcon boxSize={10} mb={5} />
          <Heading as="h3" size="md" mb={5}>
            Start contributing now!
          </Heading>
          <Text mb={2}>
            You can edit anything! Head to the suggestion page if you don't know
            where to start!
          </Text>
          <Button as={Link} to="/contribute">
            Contribute
          </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
