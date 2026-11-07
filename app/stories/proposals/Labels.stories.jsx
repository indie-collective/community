import { Badge, Box, Button, Tag, Text } from '@chakra-ui/react';

import OrgCard from '../../components/OrgCard';
import Sticker from '../../components/Sticker';
import TagList from '../../components/TagList';
import { studios } from '../fixtures';
import { Board, Row } from './shared';

export default {
  title: 'Proposals/5 Labels and chips',
  parameters: { layout: 'fullscreen' },
};

const tags = [
  { id: 't1', name: 'Platformer' },
  { id: 't2', name: 'Co-op' },
  { id: 't3', name: 'Pixel art' },
];

export const Today = {
  render: () => (
    <Board title="Labels and chips today">
      <Row label="Sticker" where="Tickets: going, online, canceled">
        <Sticker tone="sun">{"You're going"}</Sticker>
        <Sticker tone="lilac">Online</Sticker>
        <Sticker tone="coral">Canceled</Sticker>
      </Row>
      <Row label="Chakra badges" where="Organisation status, opportunity kind, timeline, IGDB">
        <Badge colorPalette="orange">On hiatus</Badge>
        <Badge colorPalette="gray">Closed</Badge>
        <Badge colorPalette="purple">Job</Badge>
        <Badge size="sm" variant="subtle">
          +1 year 7 months
        </Badge>
        <Badge size="sm" variant="outline">
          from IGDB
        </Badge>
      </Row>
      <Row label="Type badge on the logo" where="Organisation cards: a solid chip over the logo, the type again in the text">
        <Box w="300px">
          <OrgCard {...studios[0]} status="hiatus" />
        </Box>
      </Row>
      <Row label="TagList" where="Game cards and pages: grey, uppercase">
        <TagList tags={tags} />
      </Row>
      <Row label="Tag filters, games page" where="Grey, green when picked, a count badge inside">
        {[false, true].map((selected) => (
          <Tag.Root key={String(selected)} asChild size="lg" variant={selected ? 'solid' : 'subtle'} colorPalette={selected ? 'green' : 'gray'}>
            <button type="button" aria-pressed={selected}>
              <Tag.Label>{selected ? 'Puzzle' : 'Platformer'}</Tag.Label>
              <Badge variant="subtle" ml={1}>
                {selected ? 33 : 41}
              </Badge>
            </button>
          </Tag.Root>
        ))}
      </Row>
      <Row label="Tag filters, homepage" where="Ink outline pills, sun when picked">
        {['All', 'Puzzle', 'Narrative'].map((name, i) => (
          <Button
            key={name}
            size="xs"
            rounded="full"
            borderWidth="1.5px"
            borderColor={i === 0 ? 'sun' : 'ink'}
            bg={i === 0 ? 'sun' : 'transparent'}
            color={i === 0 ? 'onPop' : 'ink'}
            fontWeight="medium"
          >
            {name}
          </Button>
        ))}
      </Row>
    </Board>
  ),
};

// Two pieces. A label says something about a record, in a colour only when
// the colour means something. A chip is a tag, and when it filters, it's a
// toggle: picked is sun, like every other "on".
const NEUTRAL = { bg: 'transparent', color: 'muted', boxShadow: 'inset 0 0 0 1px var(--chakra-colors-rule)' };

const Chip = ({ children, count, pressed, as = 'span' }) => (
  <Box
    as={as}
    display="inline-flex"
    alignItems="center"
    gap={1.5}
    px={2.5}
    h="28px"
    rounded="full"
    fontSize="sm"
    fontWeight="medium"
    borderWidth="1px"
    borderColor={pressed ? 'ink' : 'rule'}
    bg={pressed ? 'sun' : 'surface'}
    color={pressed ? 'onPop' : 'ink'}
    cursor={as === 'button' ? 'pointer' : undefined}
    aria-pressed={as === 'button' ? Boolean(pressed) : undefined}
  >
    {children}
    {count != null && (
      <Text as="span" color={pressed ? 'onPop' : 'muted'} fontWeight="400" opacity={pressed ? 0.75 : 1}>
        {count}
      </Text>
    )}
  </Box>
);

export const Proposed = {
  render: () => (
    <Board title="Labels and chips, proposed: Label and Chip">
      <Row label="Label, coloured" where="Only where the colour means something: yours (sun), online (lilac), canceled (coral)">
        <Sticker tone="sun">{"You're going"}</Sticker>
        <Sticker tone="lilac">Online</Sticker>
        <Sticker tone="coral">Canceled</Sticker>
      </Row>
      <Row label="Label, neutral" where="Everything else: status, kind, source">
        <Sticker {...NEUTRAL}>On hiatus</Sticker>
        <Sticker {...NEUTRAL}>Closed</Sticker>
        <Sticker {...NEUTRAL}>Job</Sticker>
        <Sticker {...NEUTRAL}>From IGDB</Sticker>
      </Row>
      <Row label="Plain text" where="The timeline's durations: a measurement, not a label">
        <Text fontSize="sm" color="muted">
          +1 year 7 months
        </Text>
      </Row>
      <Row label="No type badge on logos" where="The type is already in the card's text (Studio · Nantes)">
        <Text fontSize="sm" color="muted">
          Removed
        </Text>
      </Row>
      <Row label="Chip" where="Tags on games, sentence case">
        {tags.map((tag) => (
          <Chip key={tag.id}>{tag.name}</Chip>
        ))}
      </Row>
      <Row label="Chip, filtering" where="Games page and homepage: a toggle with a count, sun when picked">
        <Chip as="button" pressed count={33}>
          Puzzle
        </Chip>
        <Chip as="button" count={41}>
          Platformer
        </Chip>
        <Chip as="button" count={12}>
          Narrative
        </Chip>
      </Row>
    </Board>
  ),
};
