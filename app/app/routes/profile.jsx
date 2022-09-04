import {
  Avatar,
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Switch,
  FormLabel,
  useColorMode,
  ButtonGroup,
  IconButton,
  FormControl,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { EditIcon, LinkIcon } from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { useState } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computePerson from '../models/person';
import { DiscordIcon } from '../components/DiscordIcon';
import { GitHubIcon } from '../components/GitHubIcon';
import { SteamIcon } from '../components/SteamIcon';

export const loader = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const user = await db.person.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      id: true,
      avatar_id: true,
      email: true,
      first_name: true,
      last_name: true,
      about: true,
      avatar: true,
      discord_id: true,
      github_id: true,
    },
  });

  const data = {
    currentUser: await computePerson(user),
  };

  return json(data);
};

export const meta = ({ data }) => ({
  title: `${data.currentUser.first_name}'s profile`,
});

const LinkSocialButton = ({ provider, icon, name }) => {
  const [hover, setHover] = useState(false);

  return (
    <IconButton
      as={Link}
      aria-label={`Link ${name}`}
      icon={hover ? <LinkIcon /> : icon}
      opacity={hover ? 1 : 0.5}
      colorScheme={hover ? 'green' : 'gray'}
      to={`/auth/${provider}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    />
  );
};

const Profile = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const { currentUser } = useLoaderData();
  const {
    email,
    first_name,
    last_name,
    about,
    avatar,
    discord_url,
    github_url,
  } = currentUser;

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Profile</Heading>

      <Stack
        spacing={5}
        borderWidth="1px"
        mb={10}
        p={3}
        borderRadius={5}
        align="center"
        position="relative"
      >
        <Box position="absolute" alignSelf="flex-end">
          <Button leftIcon={<EditIcon />} as={Link} to="/profile/edit">
            Edit
          </Button>
        </Box>

        <Avatar
          size="2xl"
          name={first_name}
          margin="1rem"
          src={avatar?.thumbnail_url}
        />

        <Heading as="h3">
          {first_name} {last_name}
        </Heading>
        <Heading size="md">{email}</Heading>

        <ButtonGroup>
          {discord_url ? (
            <IconButton
              as={ChakraLink}
              aria-label="Discord"
              icon={<DiscordIcon />}
              colorScheme="discord"
              href={discord_url}
              isExternal
            />
          ) : (
            <LinkSocialButton
              provider="discord"
              icon={<DiscordIcon />}
              name="Discord"
            />
          )}
          {github_url ? (
            <IconButton
              as={ChakraLink}
              aria-label="GitHub"
              icon={<GitHubIcon />}
              colorScheme="github"
              href={github_url}
              isExternal
            />
          ) : (
            <LinkSocialButton
              provider="github"
              icon={<GitHubIcon />}
              name="GitHub"
            />
          )}
        </ButtonGroup>

        {about && (
          <Box
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            borderRadius={5}
            alignSelf="stretch"
            padding={5}
          >
            <Text>{about}</Text>
          </Box>
        )}

        <FormControl display="flex" justifyContent="center" alignItems="center">
          <FormLabel htmlFor="dark-mode" mb="0">
            Dark mode
          </FormLabel>
          <Switch
            id="dark-mode"
            isChecked={colorMode === 'dark'}
            onChange={toggleColorMode}
          />
        </FormControl>
      </Stack>

      <Stack align="center">
        <Form action="/logout" method="post" to="/logout">
          <Button variant="link" type="submit">
            Logout
          </Button>
        </Form>
      </Stack>
    </Box>
  );
};

export default Profile;
