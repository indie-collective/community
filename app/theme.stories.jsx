import { Heading, Link, Stack, Text } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

export default { title: 'Theme/Typography' };

const px = (el) => parseFloat(getComputedStyle(el).fontSize);

// #173: v3 mapped each heading size to the same-named text style, about half
// v2's size; the theme restores v2's scale. Links inherit the text colour
// instead of the app-wide green palette.
export const HeadingsAndLinks = {
  render: () => (
    <Stack>
      <Heading>Default heading</Heading>
      <Heading size="lg">Large heading</Heading>
      <Heading size="md">Medium heading</Heading>
      <Text>
        Body text with <Link href="#">a plain link</Link>.
      </Text>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wide = window.innerWidth >= 768;
    await expect(px(canvas.getByText('Default heading'))).toBe(wide ? 36 : 30);
    await expect(px(canvas.getByText('Large heading'))).toBe(wide ? 30 : 24);
    await expect(px(canvas.getByText('Medium heading'))).toBe(20);
    await expect(getComputedStyle(canvas.getByText('Default heading')).fontWeight).toBe('700');

    const link = canvas.getByText('a plain link');
    await expect(getComputedStyle(link).color).toBe(getComputedStyle(link.parentElement).color);
  },
};
