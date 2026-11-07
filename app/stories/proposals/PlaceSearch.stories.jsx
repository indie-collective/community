import { Box, Field, Flex, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { LuBuilding2, LuMapPin } from 'react-icons/lu';
import { userEvent, within } from 'storybook/test';

import PlacesSearch from '../../components/PlacesSearch';
import { Board, Row } from './shared';

export default {
  title: 'Proposals/7 Place search',
  parameters: { layout: 'fullscreen' },
};

// The venue search asks the app, which Storybook doesn't serve: no venues.
const withoutVenues = (Story) => {
  if (!window.__venuesStubbed) {
    const fetch = window.fetch.bind(window);
    window.fetch = (url, ...rest) =>
      String(url).startsWith('/search-venue')
        ? Promise.resolve(new Response('[]', { headers: { 'Content-Type': 'application/json' } }))
        : fetch(url, ...rest);
    window.__venuesStubbed = true;
  }
  return <Story />;
};

// Suggestions come from Mapbox, so this one needs a connection.
export const Today = {
  decorators: [withoutVenues],
  render: () => (
    <Board title="Place search today">
      <Row label="PlacesSearch" where="Event, organisation and venue forms, missions. Three layers: PlacesSearch, MapboxAutocomplete, SelectInput">
        <Box w="460px" minH="320px">
          <PlacesSearch venues />
        </Box>
      </Row>
    </Board>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole('textbox'), 'Nantes');
  },
};

// The RecordPicker's look and keys, with places: venues first (yours, from
// the site), then Mapbox's cities and addresses.
const Mark = ({ icon }) => (
  <Flex w="28px" h="28px" rounded="md" bg="canvas" align="center" justify="center" borderWidth="1px" borderColor="rule" color="muted">
    {icon}
  </Flex>
);

const Place = ({ icon, name, meta, active }) => (
  <HStack gap={3} px={3} py={2} bg={active ? 'canvas' : undefined} rounded="md">
    <Mark icon={icon} />
    <Box minW={0}>
      <Text fontSize="sm" fontWeight="semibold">
        {name}
      </Text>
      <Text fontSize="xs" color="muted">
        {meta}
      </Text>
    </Box>
  </HStack>
);

export const Proposed = {
  render: () => (
    <Board title="Place search, proposed: one PlaceField">
      <Row label="Searching" where="Venues on the site first, then cities and addresses; the RecordPicker's menu">
        <Box w="460px">
          <Field.Root>
            <Field.Label fontWeight="semibold">Where</Field.Label>
            <Input value="Nantes" readOnly borderRadius="10px" borderColor="ink" borderWidth="2px" />
            <Stack gap={0} mt={1} p={1} w="100%" bg="surface" borderWidth="1px" borderColor="rule" rounded="xl" shadow="lift">
              <Text fontSize="xs" color="muted" px={3} pt={2} pb={1}>
                Venues
              </Text>
              <Place icon={<LuBuilding2 size={14} />} name="Le Lieu Unique" meta="Venue · Nantes" active />
              <Box borderTop="1px solid" borderColor="rule" my={1} />
              <Text fontSize="xs" color="muted" px={3} pt={1} pb={1}>
                Places
              </Text>
              <Place icon={<LuMapPin size={14} />} name="Nantes" meta="City · Loire-Atlantique, France" />
              <Place icon={<LuMapPin size={14} />} name="Rue de Nantes" meta="Address · Rennes, France" />
            </Stack>
          </Field.Root>
        </Box>
      </Row>
      <Row label="Picked" where="The place as a row, and Change">
        <Box w="460px">
          <Field.Root>
            <Field.Label fontWeight="semibold">Where</Field.Label>
            <HStack w="100%" justify="space-between" p={1} pe={3} bg="surface" borderWidth="1px" borderColor="rule" rounded="xl">
              <Place icon={<LuBuilding2 size={14} />} name="Le Lieu Unique" meta="Venue · 2 quai Ferdinand Favre, Nantes" />
              <Text fontSize="sm" fontWeight="semibold" textDecoration="underline">
                Change
              </Text>
            </HStack>
          </Field.Root>
        </Box>
      </Row>
      <Row label="Replaced" where="PlacesSearch, MapboxAutocomplete and SelectInput become one PlaceField built on RecordPicker">
        <Text fontSize="sm" color="muted">
          SelectInput has no other user
        </Text>
      </Row>
    </Board>
  ),
};
