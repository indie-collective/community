import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  IconButton,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import * as React from 'react';

import Logo from './Logo';
import { DiscordIcon } from './DiscordIcon';
import { GitHubIcon } from './GitHubIcon';
import { TwitterIcon } from './TwitterIcon';

const Footer = () => {
  const bg = useColorModeValue('white', 'gray.900');

  return (
    <Box bg={bg} shadow="sm" maxW="100%">
      <Container
        as="footer"
        role="contentinfo"
        mt="auto"
        mx="auto"
        maxWidth="960px"
      >
        <Stack
          spacing="8"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          pt={{ base: '4', md: '8' }}
          pb={{ base: '12', md: '16' }}
        >
          <Stack spacing={{ base: '6', md: '8' }} align="start">
            <Logo />
            <Text color="gray.400">
              We designed the IndieCo Community to help explore and discover
              indie games, studios, associations and events from around the
              world.
              <br />
              The project is open-source and all data is crowd-sourced!
              You're welcome to help us out 😀
            </Text>
          </Stack>
          <Stack
            direction={{ base: 'column-reverse', md: 'column', lg: 'row' }}
            spacing={{ base: '12', md: '8' }}
          >
            <Stack direction="row" spacing="8">
              <Stack spacing="4" minW="36" flex="1">
                <Text fontSize="sm" fontWeight="semibold" color="subtle">
                  Community
                </Text>
                <Stack spacing="3" shouldWrapChildren>
                  <ChakraLink as={Link} to="/games">
                    Games
                  </ChakraLink>
                  <ChakraLink as={Link} to="/studios">
                    Studios
                  </ChakraLink>
                  <ChakraLink as={Link} to="/associations">
                    Associations
                  </ChakraLink>
                  <ChakraLink as={Link} to="/events">
                    Events
                  </ChakraLink>
                </Stack>
              </Stack>
              <Stack spacing="4" minW="36" flex="1">
                <Text fontSize="sm" fontWeight="semibold" color="subtle">
                  Project
                </Text>
                <Stack spacing="3" shouldWrapChildren>
                  <ChakraLink as={Link} to="/about">
                    About
                  </ChakraLink>
                  <ChakraLink href="https://discord.gg/KxZVu2ZZYs" isExternal>
                    Feedback <ExternalLinkIcon mx="2px" />
                  </ChakraLink>
                  <ChakraLink
                    href="https://github.com/indie-collective/community"
                    isExternal
                  >
                    Contribute <ExternalLinkIcon mx="2px" />
                  </ChakraLink>
                </Stack>
                <Box mt={3}>
                  <Button
                    as={ChakraLink}
                    href="https://www.helloasso.com/associations/indie-collective/formulaires/1/en"
                    isExternal
                    style={{ textDecoration: 'none' }}
                    textDecoration="none"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Donate
                  </Button>
                </Box>
              </Stack>
              <Stack spacing="4" minW="36" flex="1">
                <Text fontSize="sm" fontWeight="semibold" color="subtle">
                  Indie Collective
                </Text>
                <Stack spacing="3" shouldWrapChildren>
                  <ChakraLink
                    as={Link}
                    to="/org/80b92a6f-d03e-4b78-8b8b-53c38a28308e"
                  >
                    Community page
                  </ChakraLink>
                  <ChakraLink href="https://indieco.xyz/" isExternal>
                    Website <ExternalLinkIcon mx="2px" />
                  </ChakraLink>
                </Stack>
                <ButtonGroup variant="ghost">
                  <IconButton
                    as="a"
                    href="https://discord.gg/KxZVu2ZZYs"
                    aria-label="Discord"
                    icon={<DiscordIcon />}
                  />
                  <IconButton
                    as="a"
                    href="https://github.com/indie-collective"
                    aria-label="GitHub"
                    icon={<GitHubIcon />}
                  />
                  <IconButton
                    as="a"
                    href="https://twitter.com/IndieColle"
                    aria-label="Twitter"
                    icon={<TwitterIcon />}
                  />
                </ButtonGroup>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
