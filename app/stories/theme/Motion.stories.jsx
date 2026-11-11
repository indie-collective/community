import { useState } from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import { LuRotateCcw } from 'react-icons/lu';
import { expect } from 'storybook/test';

import { TokenPage, TokenRow, TokenSection } from './TokenParts';
import { config, flatten, tokens } from './tokens';

export default { title: 'Theme/Motion' };

// Keyframes can't carry a description in the theme, so they're described
// here, each with the animation the site runs it with (`demo` when the
// sample needs another). The test below
// checks every keyframe in the theme is here.
const KEYFRAMES = {
  'vt-fade-out': {
    description: 'Page transitions: the page leaving fades out.',
    animation: 'vt-fade-out 120ms ease-out both',
    // Slower, and back after, so it can be seen.
    demo: 'vt-fade-out 600ms ease-out',
  },
  'vt-fade-in': {
    description: 'Page transitions: the next page fades in as it rises.',
    animation: 'vt-fade-in 260ms cubic-bezier(0.2, 0, 0, 1) 60ms both',
  },
  'badge-pop': {
    description: 'A badge just earned pops in, overshoots and settles.',
    animation: 'badge-pop 650ms cubic-bezier(0.2, 0, 0, 1) both',
  },
  rise: {
    description: 'Lists appearing (Reveal), one item after another.',
    animation: 'rise 360ms cubic-bezier(0.2, 0, 0, 1) both',
  },
  settle: {
    description: "The homepage's cover story settles into its tilt.",
    animation: 'settle 800ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
    rotate: '-3deg',
  },
  'sticker-land': {
    description: 'A sticker lands on the cover story.',
    animation: 'sticker-land 500ms cubic-bezier(0.3, 1.4, 0.5, 1) both',
  },
  highlight: {
    description: 'A place picked on the places page pulses once.',
    animation: 'highlight 500ms ease-in-out',
  },
};

const animations = flatten(tokens.animations);

const Sample = ({ animation, rotate }) => {
  const [run, setRun] = useState(0);
  return (
    <Flex
      h="120px"
      align="center"
      justify="center"
      gap={4}
      bg="canvas"
      borderRadius="card"
    >
      <Box
        key={run}
        data-sample
        animation={animation}
        transform={rotate ? `rotate(${rotate})` : undefined}
        css={{ '--sticker-rotate': '-8deg' }}
        bg="surface"
        shadow="raised"
        borderRadius="card"
        w="96px"
        h="64px"
      />
      <Button size="xs" variant="ghost" onClick={() => setRun(run + 1)}>
        <LuRotateCcw /> Replay
      </Button>
    </Flex>
  );
};

export const Keyframes = {
  render: () => (
    <TokenPage
      title="Motion"
      intro="The site's keyframes, each with the timing it runs at. Everything stops for people who ask for less motion."
    >
      <TokenSection title="Keyframes">
        {Object.entries(KEYFRAMES).map(
          ([name, { description, animation, demo, rotate }]) => (
            <TokenRow
              key={name}
              name={name}
              description={description}
              value={animation}
            >
              <Sample animation={demo ?? animation} rotate={rotate} />
            </TokenRow>
          )
        )}
      </TokenSection>
      <TokenSection title="Animation tokens" intro="animation='highlight'.">
        {animations.map((token) => (
          <TokenRow key={token.name} {...token}>
            <Sample animation={token.name} />
          </TokenRow>
        ))}
      </TokenSection>
    </TokenPage>
  ),
  play: async () => {
    await expect(Object.keys(KEYFRAMES).toSorted()).toEqual(
      Object.keys(config.theme.keyframes).toSorted()
    );
  },
};
