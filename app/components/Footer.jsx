import { LuExternalLink, LuGithub, LuInstagram } from 'react-icons/lu';
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
import * as React from 'react';
import { FaBluesky, FaGithub, FaInstagram, FaDiscord } from 'react-icons/fa6';
import { Link } from 'react-router';

import { useColorModeValue } from './ui/color-mode';
import Logo from './Logo';

const Footer = () => {
  return (
    <Box
      bg={{ base: 'white', _dark: 'gray.900' }}
      maxW="100%"
      mx={10}
      mt={3}
      borderRadius="7px 7px 0 0"
    >
      <Container
        as="footer"
        role="contentinfo"
        mt="auto"
        mx="auto"
        maxWidth="960px"
      >
        <Stack
          gap="8"
          direction="row"
          justify="space-between"
          align="center"
          px="4"
          py="4"
        >
          <Logo />

          <ChakraLink asChild>
            <Link to="/about">About</Link>
          </ChakraLink>
          <ChakraLink
            href="https://indieco.xyz/"
            target="_blank"
            rel="noopener noreferrer"
          >
            IndieCo <LuExternalLink mx="2px" />
          </ChakraLink>
          <ChakraLink
            href="https://www.helloasso.com/associations/indie-collective/formulaires/1/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate <LuExternalLink mx="2px" />
          </ChakraLink>

          <ButtonGroup variant="ghost" colorPalette="gray">
            <IconButton aria-label="Discord" asChild>
              <a href="https://discord.gg/KxZVu2ZZYs">
                <FaDiscord />
              </a>
            </IconButton>
            <IconButton aria-label="GitHub" asChild>
              <a href="https://github.com/indie-collective">
                <FaGithub />
              </a>
            </IconButton>
            <IconButton aria-label="Instagram" asChild>
              <a href="https://instagram.com/IndieColle">
                <FaInstagram />
              </a>
            </IconButton>
            <IconButton aria-label="Bluesky" asChild>
              <a href="https://bsky.app/profile/indieco.xyz">
                <FaBluesky />
              </a>
            </IconButton>
          </ButtonGroup>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
