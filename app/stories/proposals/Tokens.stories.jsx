import { Box, Flex, Grid, HStack, Text } from '@chakra-ui/react';

import { Board, Row } from './shared';

export default {
  title: 'Proposals/10 Colours and corners',
  parameters: { layout: 'fullscreen' },
};

const Swatch = ({ color, name, note, text = 'ink' }) => (
  <Box w="104px">
    <Flex h="48px" bg={color} rounded="lg" borderWidth="1px" borderColor="rule" align="flex-end" p={1.5}>
      <Text fontSize="2xs" color={text} fontWeight="semibold">
        {note}
      </Text>
    </Flex>
    <Text fontSize="xs" mt={1} color="muted" lineClamp={2}>
      {name}
    </Text>
  </Box>
);

const Corner = ({ r, name, uses }) => (
  <Box w="92px" textAlign="center">
    <Box h="56px" w="56px" mx="auto" bg="surface" borderWidth="2px" borderColor="ink" style={{ borderRadius: r }} />
    <Text fontSize="xs" fontWeight="semibold" mt={1}>
      {name}
    </Text>
    {uses && (
      <Text fontSize="2xs" color="muted">
        {uses}
      </Text>
    )}
  </Box>
);

export const Today = {
  render: () => (
    <Board title="Colours and corners today">
      <Row label="Chakra greys" where="37 uses in 15 files, around the theme's own neutrals">
        {['gray.50', 'gray.100', 'gray.200', 'gray.300', 'gray.600', 'gray.700', 'gray.900'].map((c) => (
          <Swatch key={c} color={c} name={c} />
        ))}
      </Row>
      <Row label="Chakra green" where="colorPalette=&quot;green&quot;, 36 uses: buttons, toggles, links">
        <Swatch color="green.solid" name="green.solid" />
        <Swatch color="green.subtle" name="green.subtle" />
        <Swatch color="brand" name="brand (the theme's)" />
      </Row>
      <Row label="One-off hues" where="Continents (CountriesTable), cities (CityList), uploads (teal), DateLabel (#ff0000aa)">
        {['blue.solid', 'orange.solid', 'green.solid', 'red.solid', 'cyan.solid', 'yellow.solid', 'teal.200', '#ff0000aa'].map((c) => (
          <Swatch key={c} color={c} name={c} />
        ))}
      </Row>
      <Row label="18 corner values" where="full 28, md 20, lg 10, xl 9, 5 9, 2xl 5, 10 5, 10px 3, sm 3, 3 3, and 7px, 4px, 3px, 14px, 50, 3xl, 0.5em once each">
        <Corner r="2px" name="sm" />
        <Corner r="3px" name="3px" />
        <Corner r="4px" name="4px" />
        <Corner r="5px" name="5" />
        <Corner r="6px" name="md" />
        <Corner r="7px" name="7px" />
        <Corner r="8px" name="lg / 0.5em" />
        <Corner r="10px" name="10, 10px" />
        <Corner r="12px" name="xl" />
        <Corner r="14px" name="14px" />
        <Corner r="16px" name="2xl" />
        <Corner r="24px" name="3xl" />
      </Row>
    </Board>
  ),
};

export const Proposed = {
  render: () => (
    <Board title="Colours and corners, proposed: tokens only">
      <Row label="Neutrals" where="Every grey becomes one of these; they switch with dark mode">
        <Swatch color="canvas" name="canvas: the page" />
        <Swatch color="surface" name="surface: cards, fields" />
        <Swatch color="rule" name="rule: hairlines" />
        <Swatch color="muted" name="muted: secondary text" text="canvas" />
        <Swatch color="ink" name="ink: text, outlines" text="canvas" />
      </Row>
      <Row label="Green" where="primary is new: the button fill and the calendar bar">
        <Swatch color="brand" name="brand: links, marks" />
        <Swatch color="#0f7d6d" name="primary: #0f7d6d" text="white" note="5:1" />
        <Swatch color="brandDeep" name="brandDeep: hover, small green text" text="white" />
      </Row>
      <Row label="State" where="Only for what they mean">
        <Swatch color="sun" name="sun: yours, picked, on" />
        <Swatch color="coral" name="coral: today, canceled, events" />
        <Swatch color="lilac" name="lilac: online, associations" />
      </Row>
      <Row label="Continents" where="Seven soft paper tints for the countries table, told apart by their two-letter name too">
        {[
          ['EU', '#dfe8f3'],
          ['NA', '#f6e3d3'],
          ['SA', '#dcefe4'],
          ['AS', '#f4dcdc'],
          ['OC', '#d9eef0'],
          ['AF', '#f5ecd0'],
          ['AN', '#e7e9e8'],
        ].map(([code, tint]) => (
          <Swatch key={code} color={tint} name={code} note={code} />
        ))}
      </Row>
      <Row label="Five corners" where="radii tokens, by the size of the thing">
        <Corner r="6px" name="label 6" uses="labels, keys" />
        <Corner r="10px" name="control 10" uses="buttons, fields" />
        <Corner r="14px" name="card 14" uses="cards, tickets, menus" />
        <Corner r="20px" name="panel 20" uses="panels, the calendar" />
        <Corner r="9999px" name="round" uses="chips, avatars, nav" />
      </Row>
    </Board>
  ),
};
