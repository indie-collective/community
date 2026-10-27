import {
  Avatar,
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Switch,
  Link as ChakraLink,
  Field,
  Icon,
  Alert,
  HStack,
  Input,
} from '@chakra-ui/react';
import { FaBluesky, FaMoon, FaSun } from 'react-icons/fa6';
import { LuPencil } from 'react-icons/lu';
import { Form, useLoaderData, useSearchParams } from 'react-router';
import Link from '../components/Link';

import { getProfile } from '../data/people.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { calendarToken } from '../utils/calendarToken.server';
import { SubscribeMenu } from '../components/CalendarMenus';
import { useColorMode } from '../components/ui/color-mode';
import { PageHeader } from '../components/Page';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  return {
    currentUser: await getProfile(currentUser.id),
    // #342: the private address of their events calendar.
    calendarPath: `/my-calendar/${await calendarToken(currentUser.id)}`,
  };
};

export const meta = ({ data }) => [
  {
    title: `${data.currentUser.first_name}'s profile`,
  },
];

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchParams] = useSearchParams();

  const { currentUser, calendarPath } = useLoaderData();
  const {
    username,
    first_name,
    last_name,
    about,
    avatar,
    bluesky_linked,
    bsky_handle,
  } = currentUser;
  const error = searchParams.get('error');

  return (
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Your profile" />
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
          <Heading as="span" size="sm" color="muted">
            @{username}
          </Heading>
        </Box>

        <Stack
          as="section"
          alignSelf="stretch"
          gap={3}
          aria-labelledby="sign-in-methods"
        >
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
            <HStack>
              <Icon color="blue.500">
                <FaBluesky />
              </Icon>
              <Text>
                Bluesky is linked
                {bsky_handle && (
                  <>
                    {' as '}
                    <ChakraLink
                      href={`https://bsky.app/profile/${bsky_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{bsky_handle}
                    </ChakraLink>
                  </>
                )}
              </Text>
            </HStack>
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
                  <Button
                    type="submit"
                    name="intent"
                    value="link"
                    colorPalette="blue"
                  >
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

        <Stack as="section" alignSelf="stretch" gap={2} aria-labelledby="my-calendar">
          <Heading as="h4" size="sm" id="my-calendar">
            Your events calendar
          </Heading>
          <Text fontSize="sm" color="muted">
            The events you're going to, in your calendar app, kept up to date.
            Its address is private: anyone with it sees which events you go to.
          </Text>
          <Box>
            <SubscribeMenu label="Add to my calendar" calendarPath={calendarPath} />
          </Box>
        </Stack>

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
            <Switch.Indicator fallback={<Icon as={FaMoon} color="muted" />}>
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
