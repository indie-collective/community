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
    <Box bg={bg} maxW="100%" mx={10} mt={3} borderRadius="7px 7px 0 0">
      <Container
        as="footer"
        role="contentinfo"
        mt="auto"
        mx="auto"
        maxWidth="960px"
      >
        <Stack
          spacing="8"
          direction="row"
          justify="space-between"
          align="center"
          px="4"
          py="4"
        >
            <Logo />

            <ChakraLink as={Link} to="/about">
              About
            </ChakraLink>
            <ChakraLink href="https://indieco.xyz/" isExternal>
              IndieCo <ExternalLinkIcon mx="2px" />
            </ChakraLink>
            <ChakraLink
              href="https://www.helloasso.com/associations/indie-collective/formulaires/1/en"
              isExternal
            >
              Donate <ExternalLinkIcon mx="2px" />
            </ChakraLink>

            <ButtonGroup variant="ghost" colorScheme="gray">
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
      </Container>
    </Box>
  );
};

export default Footer;
