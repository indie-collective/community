import { Box } from '@chakra-ui/react';
import { expect } from 'storybook/test';

import { BothModes, TokenPage, TokenRow, TokenSection } from './TokenParts';
import { flatten, panels, semanticTokens } from './tokens';

export default { title: 'Theme/Colors', parameters: { layout: 'padded' } };

const colors = flatten(semanticTokens.colors);

// The page's sections. Every colour the theme defines is in one, which
// the test below checks, so a new colour needs a place here.
const SECTIONS = [
  {
    title: 'Paper and ink',
    intro:
      'The page, what sits on it, and its text. Green-tinted, from the logo.',
    names: ['canvas', 'surface', 'ink', 'muted', 'rule'],
  },
  {
    title: 'Brand',
    intro: "The logo's two greens.",
    names: ['brand', 'brandDeep'],
  },
  {
    title: 'State',
    intro: 'Only to mark state. Text on them is always onPop.',
    names: ['sun', 'coral', 'lilac', 'onPop'],
  },
  {
    title: 'Primary palette',
    intro:
      "The site's green as Chakra's colorPalette, set on the root: buttons, checkboxes, switches, focus rings.",
    prefix: 'primary.',
  },
  {
    title: 'Continents',
    intro: "The countries table's soft paper tints.",
    prefix: 'continent.',
  },
];

const sectionTokens = ({ names, prefix }) =>
  names
    ? names.map((name) => colors.find((c) => c.name === name))
    : colors.filter((c) => c.name.startsWith(prefix));

const Swatch = ({ name }) => (
  <Box
    data-sample
    bg={name}
    w="64px"
    h="64px"
    borderRadius="control"
    borderWidth="1px"
    borderColor="rule"
  />
);

export const Palette = {
  render: () => (
    <TokenPage
      title="Colours"
      intro="Use these by name (bg='surface', color='muted'), never a hex value. Each is shown in light and dark mode."
    >
      {SECTIONS.map((section) => (
        <TokenSection
          key={section.title}
          title={section.title}
          intro={section.intro}
        >
          {sectionTokens(section).map((token) => (
            <TokenRow key={token.name} {...token}>
              <BothModes h="96px">
                <Swatch name={token.name} />
              </BothModes>
            </TokenRow>
          ))}
        </TokenSection>
      ))}
    </TokenPage>
  ),
  play: async ({ canvasElement }) => {
    // Every colour the theme defines is on the page, once.
    const shown = SECTIONS.flatMap(sectionTokens).map((t) => t?.name);
    await expect(shown.toSorted()).toEqual(
      colors.map((c) => c.name).toSorted()
    );

    for (const { name, value } of colors) {
      const { light, dark } = panels(canvasElement, name);
      const bg = (el) => getComputedStyle(el).backgroundColor;
      await expect(bg(light), name).not.toBe('rgba(0, 0, 0, 0)');
      // A colour with its own dark value shows it in dark mode.
      if (typeof value !== 'string')
        await expect(bg(dark), name).not.toBe(bg(light));
    }
  },
};
