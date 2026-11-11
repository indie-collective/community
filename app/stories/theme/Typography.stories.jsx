import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

import { TokenPage, TokenRow, TokenSection } from './TokenParts';
import { config, flatten, tokens } from './tokens';

export default { title: 'Theme/Typography' };

const px = (el) => parseFloat(getComputedStyle(el).fontSize);

// The type scale (design pass): Poppins semibold titles, one size per use,
// Inter text, and muted text that's actually muted. Links inherit the text
// colour instead of the app-wide green palette (#173).
export const HeadingsAndLinks = {
  render: () => (
    <Stack>
      <Heading as="h1" size="2xl">
        Page title
      </Heading>
      <Heading as="h2" size="xl">
        Section title
      </Heading>
      <Heading as="h3" size="md">
        Card title
      </Heading>
      <Text>
        Body text with <Link href="#">a plain link</Link>.
      </Text>
      <Text color="muted">Muted text</Text>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wide = window.innerWidth >= 768;
    const title = canvas.getByText('Page title');
    await expect(px(title)).toBe(wide ? 36 : 30);
    await expect(px(canvas.getByText('Section title'))).toBe(wide ? 24 : 20);
    await expect(px(canvas.getByText('Card title'))).toBe(18);
    await expect(getComputedStyle(title).fontWeight).toBe('600');
    await expect(getComputedStyle(title).fontFamily).toMatch(/^"?Poppins/);

    const body = canvas.getByText(/Body text/);
    await expect(getComputedStyle(body).fontFamily).toMatch(/^"?Inter/);
    await expect(
      getComputedStyle(canvas.getByText('Muted text')).color
    ).not.toBe(getComputedStyle(body).color);

    const link = canvas.getByText('a plain link');
    await expect(getComputedStyle(link).color).toBe(
      getComputedStyle(link.parentElement).color
    );
  },
};

const fonts = flatten(tokens.fonts);

// What each heading size is for, from the heading recipe in the theme.
const SIZES = {
  cover: "The homepage's introduction",
  '4xl': "The year in review's title",
  '3xl': 'Not used yet',
  '2xl': "A page's title (h1)",
  xl: 'A section of a page (h2)',
  lg: 'A block inside a section',
  md: "A card's title",
  sm: 'Small labels',
  xs: 'Small labels',
};

export const Scale = {
  render: () => (
    <TokenPage
      title="Typography"
      intro="Two fonts, and one heading size per use: <Heading size='xl'>."
    >
      <TokenSection title="Fonts">
        {fonts.map((token) => (
          <TokenRow key={token.name} {...token}>
            <Box data-sample fontFamily={token.name} fontSize="2xl">
              Indie Collective
            </Box>
          </TokenRow>
        ))}
      </TokenSection>
      <TokenSection title="Heading sizes">
        {Object.entries(SIZES).map(([size, use]) => (
          <TokenRow
            key={size}
            name={size}
            description={use}
            value={`<Heading size="${size}">`}
          >
            <Heading data-sample size={size} lineClamp={1}>
              Indie games
            </Heading>
          </TokenRow>
        ))}
      </TokenSection>
    </TokenPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(Object.keys(SIZES).toSorted()).toEqual(
      Object.keys(config.theme.recipes.heading.variants.size).toSorted()
    );
    const sample = (name) =>
      canvasElement.querySelector(`[data-token="${name}"] [data-sample]`);
    await expect(getComputedStyle(sample('heading')).fontFamily).toMatch(
      /^"?Poppins/
    );
    await expect(getComputedStyle(sample('body')).fontFamily).toMatch(
      /^"?Inter/
    );
  },
};
