import { Button, IconButton } from '@chakra-ui/react';
import {
  LuBell,
  LuBellOff,
  LuCalendarPlus,
  LuCheck,
  LuEllipsis,
  LuExternalLink,
  LuPlus,
  LuShare2,
  LuTrash2,
} from 'react-icons/lu';

import ActionMenu from '../../components/ActionMenu';
import { AddToCalendar, SubscribeMenu } from '../../components/CalendarMenus';
import FollowButton from '../../components/FollowButton';
import JoinEventButton from '../../components/JoinEventButton';
import ShareMenu from '../../components/ShareMenu';
import { events, member } from '../fixtures';
import { Board, Row } from './shared';

export default {
  title: 'Proposals/1 Buttons',
  parameters: { layout: 'fullscreen', router: { currentUser: member } },
};

// The buttons as the pages use them now.
export const Today = {
  render: () => (
    <Board title="Buttons today">
      <Row label="Chakra solid (default)" where="Add an event, Add a studio, Save">
        <Button size="sm">
          <LuPlus /> Add an event
        </Button>
      </Row>
      <Row label="Ink, pop" where="Homepage: Add a game">
        <Button variant="pop" size="sm">
          <LuPlus /> Add a game
        </Button>
      </Row>
      <Row label="Ink outline, popOutline" where="Subscribe, Add to calendar, Near me, header">
        <SubscribeMenu calendarPath="/calendar.ics" feedPath="/events/feed.xml" />
        <AddToCalendar event={events[0]} path="/event/e1" place="Nantes" />
      </Row>
      <Row label="Green outline" where="Share, Website, Load more, Edit (17 places)">
        <ShareMenu title="Nantes Game Jam" path="/event/e1" />
        <Button size="sm" variant="outline">
          <LuExternalLink /> Website
        </Button>
        <Button variant="outline">Load more</Button>
      </Row>
      <Row label="Toggles" where="Going (event), Follow (everything)">
        <JoinEventButton eventId="e1" isGoing={false}>
          {"I'm going"}
        </JoinEventButton>
        <JoinEventButton eventId="e1" isGoing>
          Going
        </JoinEventButton>
        <FollowButton type="event" id="e1" following={false} />
        <FollowButton type="event" id="e1" following />
      </Row>
      <Row label="Ghost and plain" where="More actions, Show all, Delete">
        <ActionMenu editLink="/event/e1/edit" onDelete={() => {}} />
        <Button variant="plain" size="xs" textDecoration="underline">
          Show all
        </Button>
        <Button size="sm" variant="ghost" colorPalette="red">
          Delete
        </Button>
      </Row>
    </Board>
  ),
};

// Four kinds, all in ink: the one thing to do, the other things to do, the
// small ones, and on/off. Sun yellow only marks what's on.
// Primary in the brand's green. White on the logo's own green (#149c88) is
// 3.4:1, under the 4.5:1 text needs, so the fill is a step darker
// (#0f7d6d, 5:1) and deepens on hover. Dark mode keeps its light green with
// dark text.
const green = (bg, color, hover) => ({
  variant: 'pop',
  bg,
  color,
  borderColor: bg,
  _hover: { bg: hover, borderColor: hover },
});
const primary = green(
  { base: '#0f7d6d', _dark: 'brand' },
  { base: 'white', _dark: 'canvas' },
  'brandDeep'
);
const secondary = { variant: 'popOutline' };
const quiet = {
  variant: 'ghost',
  color: 'ink',
  borderRadius: '10px',
  fontWeight: 'semibold',
  _hover: { bg: 'surface' },
};
const toggle = (on) => ({
  variant: 'popOutline',
  'aria-pressed': on,
  ...(on && { bg: 'sun', color: 'onPop', borderColor: 'ink', _hover: { bg: 'sun' } }),
});

export const Proposed = {
  render: () => (
    <Board title="Buttons, proposed">
      <Row label="Primary, the options" where="White on the logo green / ink on it / white on a step darker">
        <Button size="sm" {...green('brand', 'white', 'brandDeep')}>
          <LuPlus /> 3.4:1, too faint
        </Button>
        <Button size="sm" {...green('brand', 'ink', 'brandDeep')} _hover={{ bg: 'brandDeep', color: 'white' }}>
          <LuPlus /> 4.9:1, ink
        </Button>
        <Button size="sm" {...primary}>
          <LuPlus /> 5:1, proposed
        </Button>
      </Row>
      <Row label="Primary" where="One per screen: Add an event, Save, Add a game">
        <Button size="sm" {...primary}>
          <LuPlus /> Add an event
        </Button>
        <Button {...primary}>Save</Button>
      </Row>
      <Row label="Secondary" where="Every other action: Share, Website, Add to calendar, Subscribe, Load more, Edit">
        <Button size="sm" {...secondary}>
          <LuShare2 /> Share
        </Button>
        <Button size="sm" {...secondary}>
          <LuExternalLink /> Website
        </Button>
        <Button size="sm" {...secondary}>
          <LuCalendarPlus /> Add to calendar
        </Button>
        <Button {...secondary}>Load more</Button>
      </Row>
      <Row label="Toggle" where="One component for Going and Follow: off is secondary, on is sun">
        <Button size="sm" {...toggle(false)}>
          <LuCheck /> {"I'm going"}
        </Button>
        <Button size="sm" {...toggle(true)}>
          <LuCheck /> Going
        </Button>
        <Button size="sm" {...toggle(false)}>
          <LuBell /> Follow
        </Button>
        <Button size="sm" {...toggle(true)}>
          <LuBellOff /> Following
        </Button>
      </Row>
      <Row label="Quiet" where="Small actions and menus: More actions, Show all, Delete">
        <IconButton size="sm" aria-label="More actions" {...quiet}>
          <LuEllipsis />
        </IconButton>
        <Button size="sm" {...quiet}>
          Show all
        </Button>
        {/* Coral text is too faint to read on white; the confirmation
            dialog does the warning. */}
        <Button size="sm" {...quiet}>
          <LuTrash2 /> Delete
        </Button>
      </Row>
    </Board>
  ),
};
