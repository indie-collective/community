import { Heading, Link, Stack, Text } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

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
    await expect(getComputedStyle(canvas.getByText('Muted text')).color).not.toBe(
      getComputedStyle(body).color
    );

    const link = canvas.getByText('a plain link');
    await expect(getComputedStyle(link).color).toBe(getComputedStyle(link.parentElement).color);
  },
};
