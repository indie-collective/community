import { Box, Field, Flex, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { userEvent, within } from 'storybook/test';

import AtlasMark from '../../components/AtlasMark';
import MissionInput from '../../components/MissionInput';
import PreviousEditionPicker from '../../components/PreviousEditionPicker';
import { SearchGameModal } from '../../routes/search-game';
import { SearchOrgModal } from '../../routes/search-org';
import { games, studios } from '../fixtures';
import { Board, Row } from './shared';

const found = studios.slice(0, 3);

export default {
  title: 'Proposals/6 Pickers',
  parameters: {
    layout: 'fullscreen',
    router: {
      routes: [
        { path: 'search-org', loader: () => found, action: () => found },
        { path: 'search-game', loader: () => games.slice(0, 3), action: () => games.slice(0, 3) },
        {
          path: 'search-event',
          loader: () => [{ id: 'e0', name: 'Nantes Game Jam 2025', starts_at: '2025-11-14T17:00:00.000Z' }],
        },
      ],
    },
  },
};

const typeInto = (name, text) => async ({ canvasElement }) => {
  const page = within(canvasElement.ownerDocument.body);
  const boxes = await page.findAllByRole('textbox');
  for (const box of boxes) await userEvent.type(box, text);
};

export const TodayOrgDialog = {
  name: 'Today: link a studio (game and event pages)',
  render: () => <SearchOrgModal isOpen />,
  play: typeInto('org', 'Pixel'),
};

export const TodayGameDialog = {
  name: 'Today: link a game (event page)',
  render: () => <SearchGameModal isOpen />,
  play: typeInto('game', 'Salt'),
};

export const TodayInline = {
  name: 'Today: inline pickers',
  render: () => (
    <Board title="Pickers today, inline">
      <Row label="Mission: studio" where="Missions: a field, results as ghost buttons, Add rows">
        <Box w="420px">
          <MissionInput kind="game" gap={{ key: 'studio', input: 'organization' }} />
        </Box>
      </Row>
      <Row label="Previous edition" where="Event form: its own search and list">
        <Box w="420px">
          <PreviousEditionPicker />
        </Box>
      </Row>
    </Board>
  ),
  play: typeInto('inline', 'Nantes'),
};

// One RecordPicker: a field that searches as you type, results with their
// mark and where they are, then the ways to add what isn't there yet. Inline
// in forms; on a record's page it opens in a small popover under its button,
// not a full dialog.
const Result = ({ org, active }) => (
  <HStack gap={3} px={3} py={2} bg={active ? 'canvas' : undefined} rounded="md">
    <Flex w="28px" h="28px" rounded="md" bg="canvas" align="center" justify="center" borderWidth="1px" borderColor="rule">
      <AtlasMark type={org.type} size={14} />
    </Flex>
    <Box minW={0}>
      <Text fontSize="sm" fontWeight="semibold">
        {org.name}
      </Text>
      <Text fontSize="xs" color="muted">
        {org.type === 'studio' ? 'Studio' : 'Association'} · {org.location.city}
      </Text>
    </Box>
  </HStack>
);

const AddRow = ({ children }) => (
  <HStack gap={2} px={3} py={2} fontSize="sm" fontWeight="semibold">
    <LuPlus />
    <Text>{children}</Text>
  </HStack>
);

const Picker = ({ label, query, children }) => (
  <Field.Root>
    <Field.Label fontWeight="semibold">{label}</Field.Label>
    <Input value={query} readOnly placeholder="Search by name" borderRadius="10px" borderColor="ink" borderWidth="2px" />
    {children}
  </Field.Root>
);

const Menu = ({ children }) => (
  <Stack gap={0} mt={1} p={1} w="100%" bg="surface" borderWidth="1px" borderColor="rule" rounded="xl" shadow="lift">
    {children}
  </Stack>
);

export const Proposed = {
  render: () => (
    <Board title="Pickers, proposed: one RecordPicker">
      <Row label="Searching" where="Results with their mark and place; the first is highlighted, arrows move, Enter picks">
        <Box w="420px">
          <Picker label="Studio" query="Pix">
            <Menu>
              {found.map((org, i) => (
                <Result key={org.id} org={org} active={i === 0} />
              ))}
              <Box borderTop="1px solid" borderColor="rule" my={1} />
              <AddRow>Add “Pix” as a studio</AddRow>
              <AddRow>Add “Pix” as an association</AddRow>
            </Menu>
          </Picker>
        </Box>
      </Row>
      <Row label="Picked" where="The record as a row, and Change to search again">
        <Box w="420px">
          <Field.Root>
            <Field.Label fontWeight="semibold">Studio</Field.Label>
            <HStack w="100%" justify="space-between" p={1} pe={3} bg="surface" borderWidth="1px" borderColor="rule" rounded="xl">
              <Result org={found[0]} />
              <Text fontSize="sm" fontWeight="semibold" textDecoration="underline">
                Change
              </Text>
            </HStack>
          </Field.Root>
        </Box>
      </Row>
      <Row label="Same picker, other records" where="Games for an event, a previous edition, an organiser in a mission">
        <Box w="420px">
          <Picker label="Previous edition" query="Nantes">
            <Menu>
              <HStack gap={3} px={3} py={2} bg="canvas" rounded="md">
                <Flex w="28px" h="28px" rounded="md" bg="canvas" align="center" justify="center" borderWidth="1px" borderColor="rule">
                  <AtlasMark type="event" size={14} />
                </Flex>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold">
                    Nantes Game Jam 2025
                  </Text>
                  <Text fontSize="xs" color="muted">
                    Event · Nov 14, 2025
                  </Text>
                </Box>
              </HStack>
            </Menu>
          </Picker>
        </Box>
      </Row>
      <Row label="Replaced" where="SearchOrgModal, SearchGameModal, the mission's own field, PreviousEditionPicker's list, PickerCreate">
        <Text fontSize="sm" color="muted">
          Five components, two of them dialogs living in the routes folder
        </Text>
      </Row>
    </Board>
  ),
};
