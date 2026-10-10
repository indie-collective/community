import {
  Avatar,
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Switch,
  ButtonGroup,
  IconButton,
  Link as ChakraLink,
  Field,
  Icon,
  Alert,
  HStack,
  Input,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaBluesky, FaDiscord, FaMoon, FaSun } from 'react-icons/fa6';
import { LuPencil, LuLink } from 'react-icons/lu';
import { Form, Link, useLoaderData, useSearchParams } from 'react-router';

import { getProfile } from '../data/people.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { useColorMode } from '../components/ui/color-mode';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  return {
    currentUser: await getProfile(currentUser.id),
  };
};

export const meta = ({ data }) => [
  {
    title: `${data.currentUser.first_name}'s profile`,
  },
];

const LinkSocialButton = ({ provider, icon, name }) => {
  const [hover, setHover] = useState(false);

  return (
    <IconButton
      aria-label={`Link ${name}`}
      opacity={hover ? 1 : 0.5}
      colorPalette={hover ? 'green' : 'gray'}
      asChild
    >
      <Link
        to={`/auth/${provider}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {hover ? <LuLink /> : icon}
      </Link>
    </IconButton>
  );
};

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchParams] = useSearchParams();

  const { currentUser } = useLoaderData();
  const {
    username,
    first_name,
    last_name,
    about,
    avatar,
    discord_url,
    bluesky_linked,
    can_unlink_bluesky,
  } = currentUser;
  const error = searchParams.get('error');

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Profile</Heading>
      <Stack
        gap={5}
        borderWidth="1px"
        mb={10}
        p={3}
        borderRadius={5}
        align="center"
        position="relative"
      >
        <Box position="absolute" alignSelf="flex-end">
          <Button asChild>
            <Link to="/profile/edit">
              <LuPencil />
              Edit
            </Link>
          </Button>
        </Box>

        <Avatar.Root size="2xl" margin="1rem">
          <Avatar.Fallback name={first_name} />
          <Avatar.Image src={avatar?.thumbnail_url} />
        </Avatar.Root>

        <Box as="header" textAlign="center">
          <Heading as="h3">
            {first_name} {last_name}
          </Heading>
          <Heading as="span" size="sm" color="gray.500">
            @{username}
          </Heading>
        </Box>

        <Stack as="section" alignSelf="stretch" gap={3} aria-labelledby="sign-in-methods">
          <Heading as="h4" size="sm" id="sign-in-methods">
            Sign-in methods
          </Heading>
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              {error}
            </Alert.Root>
          )}
          {bluesky_linked ? (
            <Form method="post" action="/profile/bluesky">
              <HStack justify="space-between">
                <HStack>
                  <Icon color="blue.500">
                    <FaBluesky />
                  </Icon>
                  <Text>Bluesky is linked</Text>
                </HStack>
                <Button
                  type="submit"
                  name="intent"
                  value="unlink"
                  size="sm"
                  variant="outline"
                  disabled={!can_unlink_bluesky}
                  title={
                    can_unlink_bluesky
                      ? undefined
                      : "It's your only way to sign in."
                  }
                >
                  Unlink
                </Button>
              </HStack>
            </Form>
          ) : (
            <Form method="post" action="/profile/bluesky">
              <Field.Root>
                <Field.Label>Link your Bluesky account</Field.Label>
                <HStack width="100%">
                  <Input
                    name="handle"
                    placeholder="yourname.bsky.social"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  <Button type="submit" name="intent" value="link" colorPalette="blue">
                    <FaBluesky />
                    Link
                  </Button>
                </HStack>
                <Field.HelperText>
                  Then you can sign in with Bluesky, and keep everything you
                  added.
                </Field.HelperText>
              </Field.Root>
            </Form>
          )}
        </Stack>

        {searchParams.has('beta') && (
          <ButtonGroup>
            {discord_url ? (
              <IconButton
                aria-label="Discord"
                colorPalette="discord"
                asChild
              >
                <ChakraLink
                  href={discord_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaDiscord />
                </ChakraLink>
              </IconButton>
            ) : (
              <LinkSocialButton
                provider="discord"
                icon={<FaDiscord />}
                name="Discord"
              />
            )}
          </ButtonGroup>
        )}

        {about && (
          <Box
            bg={{ base: 'gray.100', _dark: 'gray.700' }}
            borderRadius={5}
            alignSelf="stretch"
            padding={5}
          >
            <Text>{about}</Text>
          </Box>
        )}

        <Switch.Root
          colorPalette="blue"
          size="lg"
          checked={colorMode === 'dark'}
          onCheckedChange={toggleColorMode}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
            <Switch.Indicator fallback={<Icon as={FaMoon} color="gray.400" />}>
              <Icon as={FaSun} color="yellow.400" />
            </Switch.Indicator>
          </Switch.Control>
          <Switch.Label>Dark mode</Switch.Label>
        </Switch.Root>
      </Stack>
      <Stack align="center">
        <Form action="/logout" method="post" to="/logout">
          <Button variant="plain" type="submit">
            Logout
          </Button>
        </Form>
      </Stack>
    </Box>
  );
};

export default Profile;
