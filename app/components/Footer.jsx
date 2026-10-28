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
import FeedbackWidget from './FeedbackWidget';
import * as React from 'react';
import { FaBluesky, FaGithub, FaInstagram, FaDiscord } from 'react-icons/fa6';
import Link from './Link';

import Logo from './Logo';
import { useT } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

const Footer = () => {
  const t = useT();
  return (
    <Box
      bg="surface"
      maxW="100%"
      mx={{ base: 4, md: 10 }}
      mt={3}
      borderRadius="7px 7px 0 0"
      // Stays put while the page changes (view transitions).
      css={{ viewTransitionName: 'site-footer' }}
    >
      <Container
        as="footer"
        role="contentinfo"
        mt="auto"
        mx="auto"
        maxWidth="960px"
      >
        {/* Wraps on phones: one row of logo, links and four icons is
            wider than a 375px screen. */}
        <Stack
          gap={{ base: 4, md: 8 }}
          direction="row"
          wrap="wrap"
          justify={{ base: 'center', md: 'space-between' }}
          align="center"
          px="4"
          py="4"
        >
          <Logo />

          <ChakraLink asChild>
            <Link to="/about">{t('footer.about')}</Link>
          </ChakraLink>
          <ChakraLink asChild>
            <Link to="/data">{t('footer.data')}</Link>
          </ChakraLink>
          <ChakraLink asChild>
            <Link to="/api">{t('footer.api')}</Link>
          </ChakraLink>
          {/* #320 */}
          <FeedbackWidget />
          {/* #344 */}
          <LanguageSwitcher />
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
            {t('footer.donate')} <LuExternalLink mx="2px" />
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
