import { chakra, Button, ButtonGroup, VisuallyHidden } from '@chakra-ui/react'
import { Form } from '@remix-run/react';
import { SocialsProvider } from 'remix-auth-socials';

import { DiscordIcon } from './DiscordIcon';
import { GitHubIcon } from './GitHubIcon';

const SocialButton = ({ provider, name, icon }) => (
  <chakra.form
    as={Form}
    action={`/auth/${provider}`}
    method="post"
    width="100%"
  >
    <Button width="100%" type="submit" colorScheme={provider}>
      <VisuallyHidden>Sign in with {name}</VisuallyHidden>
      {icon}
    </Button>
  </chakra.form>
);

const OAuthButtonGroup = () => (
  <ButtonGroup variant="outline" spacing="4" width="full">
    <SocialButton
      name="GitHub"
      provider={SocialsProvider.GITHUB}
      icon={<GitHubIcon boxSize="5" />}
    />

    <SocialButton
      name="Discord"
      provider={SocialsProvider.DISCORD}
      icon={<DiscordIcon boxSize="5" />}
    />
  </ButtonGroup>
);

export default OAuthButtonGroup;
