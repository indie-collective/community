import { LuPencil, LuExternalLink, LuStar } from 'react-icons/lu';
import {
    Box,
  Button,
  Checkbox,
  Heading,
  Input,
  Link as ChakraLink,
  SimpleGrid,
  Text,
  Field,
} from '@chakra-ui/react';
import { redirect,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation } from 'react-router';
import { FaDiscord } from 'react-icons/fa6';

import { authenticator } from '../utils/auth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { db } from '../utils/db.server';
import { commitSession, getSession } from '../utils/session.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  return { currentUser };
};

export async function action({ request }) {
  const currentUser = await isAuthenticated(request, {
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

    return { currentUser: updatedUser }, { headers };
  } catch (error) {
    const values = Object.fromEntries(formData);
    return {
      errors: {
        email:
          "This email can't be chosen. If you already registered with this email, either choose a different one or sign in to link your account.",
      },
      values,
    };
  }
}

export default function Welcome() {
  const { currentUser } = useLoaderData();
  const actionData = useActionData();

  const navigation = useNavigation();

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
            <Field.Root mb={5} invalid={actionData?.errors.email} required>
              <Field.Label htmlFor="email">Email</Field.Label>
              <Input
                type="email"
                name="email"
                placeholder="test@example.com"
                defaultValue={actionData?.values.email}
              />
              <Field.ErrorText>{actionData?.errors.email}</Field.ErrorText>
            </Field.Root>

            <Field.Root mb={10} required>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>
                  I agree with to give my soul to Indie Collective
                </Checkbox.Label>
              </Checkbox.Root>
            </Field.Root>

            <Button
              type="submit"
              width="100%"
              loading={navigation.state === 'submitting'}
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
          <LuStar boxSize={10} mb={5} />
          <Heading as="h3" size="md" mb={5}>
            Personalize your profile
          </Heading>
          <Text mb={2}>
            Personalize your dashboard through services integrations and
            fine-tune your research.
          </Text>
          <Button asChild>
            <Link to="/profile">Go to Profile</Link>
          </Button>
        </Box>

        <Box>
          <FaDiscord boxSize={10} mb={5} />
          <Heading as="h3" size="md" mb={5}>
            Questions? Need help?
          </Heading>
          <Text mb={2}>
            Let's have a chat about Community! And special features for Indie
            Collective's members.
          </Text>
          <Button
            isExternal
            style={{ textDecoration: 'none' }}
            textDecoration="none"
            asChild
          >
            <ChakraLink href="https://discord.gg/KxZVu2ZZYs">
              Check our Discord
              <LuExternalLink />
            </ChakraLink>
          </Button>
        </Box>

        {currentUser.isGuildMember ? (
          <Box>
            <LuPencil boxSize={10} mb={5} />
            <Heading as="h3" size="md" mb={5}>
              Start contributing now!
            </Heading>
            <Text mb={2}>
              You can edit anything! Head to the suggestion page if you don't
              know where to start!
            </Text>
            <Button asChild>
              <Link to="/contribute">Contribute</Link>
            </Button>
          </Box>
        ) : (
          <Box>
            <LuPencil boxSize={10} mb={5} />
            <Heading as="h3" size="md" mb={5}>
              Join the Discord to contribute
            </Heading>
            <Text mb={2}>
              Oh no! You're not part of Indie Collective's Discord.
              <br />
              Join now if you want to contribute!
            </Text>
            <Button
              isExternal
              style={{ textDecoration: 'none' }}
              textDecoration="none"
              asChild
            >
              <ChakraLink href="">
                Join IC's Discord
                <FaDiscord />
              </ChakraLink>
            </Button>
          </Box>
        )}
      </SimpleGrid>
    </Box>
  );
}
