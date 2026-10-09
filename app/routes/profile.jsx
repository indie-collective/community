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
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaDiscord, FaMoon, FaSun } from 'react-icons/fa6';
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
  } = currentUser;

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
