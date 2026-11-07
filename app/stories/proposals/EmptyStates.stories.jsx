import { Box, Button, Flex, Image, Stack, Text } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';

import EmptyHint from '../../components/EmptyHint';
import noEventsImage from '../../assets/undraw_festivities_tvvj.svg';
import { Board, Row } from './shared';

export default {
  title: 'Proposals/9 Empty states',
  parameters: { layout: 'fullscreen' },
};

const Cell = ({ children }) => <Box w="460px">{children}</Box>;

export const Today = {
  render: () => (
    <Board title="Empty states today">
      <Row label="Homepage" where="Picture, xl text, a small “(yet)” on its own line">
        <Cell>
          <Box w="200px" mx="auto">
            <Image src={noEventsImage} alt="" />
            <Text fontSize="xl" mt={5} textAlign="center">
              No upcoming events
              <br />
              <small>(yet)</small>
            </Text>
          </Box>
        </Cell>
      </Row>
      <Row label="Events page, NoEvents" where="Picture, lg muted text">
        <Cell>
          <Stack align="center" textAlign="center" gap={5}>
            <Image src={noEventsImage} alt="" maxW="200px" />
            <Text fontSize="lg" color="muted">
              No upcoming events in person yet.
            </Text>
          </Stack>
        </Cell>
      </Row>
      <Row label="Country page" where="Picture, lg ink text, then an EmptyHint with a link">
        <Cell>
          <Flex direction="column" align="center" gap={4}>
            <Image src={noEventsImage} alt="" maxW="12rem" />
            <Text fontSize="lg">No upcoming events in Belgium.</Text>
            <EmptyHint>Know one? Add an event.</EmptyHint>
          </Flex>
        </Cell>
      </Row>
      <Row label="EmptyHint" where="Venue page and sections: small muted text">
        <EmptyHint>Nothing planned here for now.</EmptyHint>
      </Row>
      <Row label="Plain text" where="Related events, search dialogs: ink text, a period">
        <Text>No related events.</Text>
        <Text>No results found.</Text>
      </Row>
      <Row label="Italic" where="Rewind">
        <Text fontStyle="italic" color="muted">
          No tags recorded this year.
        </Text>
      </Row>
    </Board>
  ),
};

// One Empty: what's missing, in a sentence, and the way to add it when there
// is one. The picture only where a whole list is empty, never in a section.
const Empty = ({ picture, children, action }) =>
  picture ? (
    <Stack align="center" textAlign="center" gap={4} py={6}>
      <Image src={noEventsImage} alt="" maxW="180px" />
      <Text fontSize="lg" color="muted">
        {children}
      </Text>
      {action}
    </Stack>
  ) : (
    <Flex
      align="center"
      justify="space-between"
      gap={4}
      wrap="wrap"
      px={4}
      py={3}
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="rule"
      rounded="xl"
    >
      <Text fontSize="sm" color="muted">
        {children}
      </Text>
      {action}
    </Flex>
  );

const Add = ({ children }) => (
  <Button size="sm" variant="popOutline">
    <LuPlus /> {children}
  </Button>
);

export const Proposed = {
  render: () => (
    <Board title="Empty states, proposed: one Empty">
      <Row label="Empty list" where="A whole list with nothing in it: homepage events, events page, country events">
        <Cell>
          <Empty picture action={<Add>Add an event</Add>}>
            No upcoming events in Belgium yet
          </Empty>
        </Cell>
      </Row>
      <Row label="Empty section" where="A section of a page: venue, related events, a country's associations">
        <Cell>
          <Empty action={<Add>Add an event</Add>}>Nothing planned here yet</Empty>
        </Cell>
      </Row>
      <Row label="Empty, nothing to add" where="Search results, rewind, admin lists">
        <Cell>
          <Empty>No tags recorded this year</Empty>
        </Cell>
      </Row>
      <Row label="Rules" where="Muted, no period, no italic; the action only for members">
        <Text fontSize="sm" color="muted">
          Replaces EmptyHint, NoEvents and the inline texts
        </Text>
      </Row>
    </Board>
  ),
};
