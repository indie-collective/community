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
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import * as React from 'react';

import Logo from './Logo';
import { DiscordIcon } from './DiscordIcon';
import { GitHubIcon } from './GitHubIcon';
import { TwitterIcon } from './TwitterIcon';

const Footer = () => (
  <Container as="footer" role="contentinfo" maxW="100%" mt="auto">
    <Stack
      spacing="8"
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      py={{ base: '12', md: '16' }}
    >
      <Stack spacing={{ base: '6', md: '8' }} align="start">
        <Logo />
        <Text color="muted">
          Community lets you explore indie game-focused data around the world.
          <br />
          Discover who, where and what has been / is being made near you through
          crowd-sourced data.
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
              <ChakraLink as={Link} to="/orgs">
                Orgs
              </ChakraLink>
              <ChakraLink as={Link} to="/events">
                Events
              </ChakraLink>
              <ChakraLink as={Link} to="/places">
                Places
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
                href="https://discord.gg/"
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
);

export default Footer;
