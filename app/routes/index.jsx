import {
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Button,
  Flex,
  HStack,
  Input,
  Stack,
  VisuallyHidden,
} from '@chakra-ui/react';
import { LuPlus, LuRefreshCw, LuSearch } from 'react-icons/lu';

import { useMemo, useState } from 'react';
import { Form, useLoaderData } from 'react-router';
import Link from '../components/Link';

import isAuthenticated from '../utils/isAuthenticated.server';
import GameCard, { gameImage } from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import EventCard from '../components/EventCard';
import PlacesWidget from '../components/PlacesWidget';
import { Department, Page } from '../components/Page';
import Card from '../components/Card';
import CardLink from '../components/CardLink';
import Sticker from '../components/Sticker';
import usePlaceholder from '../hooks/usePlaceholder';
import { gamePath } from '../utils/slug';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';
import { countEvents, listUpcomingEvents } from '../data/events.server';
import { countGames, listFeaturedGames } from '../data/games.server';
import {
  countOrganizations,
  listFeaturedOrganizations,
  listOrganizationPoints,
} from '../data/organizations.server';
import Reveal from '../components/Reveal';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request);

  const [
    games,
    associations,
    studios,
    eventsToCome,
    joinedEventsToCome,
    placesPoints,
    gamesCount,
    orgsCount,
    eventsCount,
  ] = await Promise.all([
    // #199: complete entries, recently updated, rather than the newest.
    listFeaturedGames({ limit: 6 }),
    listFeaturedOrganizations({ type: 'association', limit: 6 }),
    listFeaturedOrganizations({ type: 'studio', limit: 6 }),
    listUpcomingEvents({ limit: 6 }),
    currentUser
      ? listUpcomingEvents({ limit: 3, attendeeId: currentUser.id })
      : [],
    listOrganizationPoints(),
    // Only the signed-out introduction shows the counts.
    currentUser ? null : countGames(),
    currentUser ? null : countOrganizations(),
    currentUser ? null : countEvents(),
  ]);

  return {
    games,
    associations,
    studios,
    eventsToCome,
    joinedEventsToCome,
    placesCount: placesPoints.length,
    placesPoints,
    counts: { games: gamesCount, orgs: orgsCount, events: eventsCount },
    currentUser,
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Indie Collective - Community powered video game data',
    description:
      'The indie game scene, mapped by its community: studios, associations, games and events from around the world, in an open database anyone can add to.',
    path: location.pathname,
  });

const number = (n) => n.toLocaleString('en');

// The homepage is the current issue of a magazine about the indie scene
// (magazine pass): a cover, then departments, each with its own furniture.

// The cover story: one of the featured games, full bleed, set a little
// off-straight under a sticker. "Another" turns to the next one.
const CoverStory = ({ games }) => {
  const placeholder = usePlaceholder();
  const [index, setIndex] = useState(0);
  const game = games[index];
  if (!game) return null;
  const { image, imageSrcSet } = gameImage(game);
  const studio = game.entities?.[0]?.name;

  return (
    <Box
      position="relative"
      minW={0}
      w="100%"
      maxW={{ base: '380px', md: 'none' }}
      mx="auto"
    >
      <Sticker
        round
        land
        rotate={-14}
        position="absolute"
        top="-18px"
        left="-18px"
        zIndex={2}
      >
        Cover
        <br />
        story
      </Sticker>
      <Card
        isClickable
        aspectRatio={4 / 5}
        rounded="2xl"
        overflow="hidden"
        borderWidth="2px"
        borderColor="ink"
        shadow="lift"
        transform="rotate(2.5deg)"
        animation="settle 800ms cubic-bezier(0.2, 0.8, 0.2, 1) both"
        transition="transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1)"
        _hover={{ transform: 'rotate(0deg) scale(1.01)' }}
      >
        <Image
          key={game.id}
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          src={image ?? placeholder}
          srcSet={imageSrcSet}
          alt=""
          data-card-image
          animation="rise 360ms cubic-bezier(0.2, 0, 0, 1) both"
        />
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          p={5}
          pt={16}
          color="white"
          bgGradient="to-t"
          gradientFrom="rgba(5, 20, 18, 0.9)"
          gradientTo="transparent"
        >
          <Text
            fontSize="xs"
            fontWeight="semibold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="sun"
          >
            Game of the issue
          </Text>
          <Heading
            as="h2"
            fontSize="3xl"
            fontWeight="800"
            letterSpacing="-0.02em"
            lineHeight="1.05"
          >
            <CardLink to={gamePath(game)}>{game.name}</CardLink>
          </Heading>
          {(studio || game.tags?.length > 0) && (
            <Text fontSize="sm" opacity={0.9} mt={1} lineClamp={1}>
              {[studio, ...(game.tags ?? []).slice(0, 2).map((t) => t.name)]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
        </Box>
      </Card>
      {games.length > 1 && (
        <Button
          variant="popOutline"
          bg="surface"
          size="sm"
          position="absolute"
          top={3}
          right={3}
          zIndex={2}
          onClick={() => setIndex((index + 1) % games.length)}
        >
          <LuRefreshCw />
          Another
        </Button>
      )}
    </Box>
  );
};

// #200: what the site is, search, and the size of the database. Only for
// people who aren't signed in: members know.
const Cover = ({ counts, games }) => (
  <Grid
    as="header"
    templateColumns={{ base: '1fr', md: '1.2fr 0.8fr' }}
    gap={{ base: 10, md: 10 }}
    alignItems="center"
    pt={{ base: 2, md: 4 }}
    mb={{ base: 12, md: 16 }}
  >
    <Box minW={0}>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        letterSpacing="wider"
        textTransform="uppercase"
        color="brandDeep"
        mb={3}
      >
        The open database of the indie scene
      </Text>
      <Heading as="h1" size="cover">
        The indie game scene,{' '}
        <Box
          as="span"
          px={1}
          // A highlighter stroke across the lower half of the words.
          bgImage="linear-gradient(transparent 58%, var(--chakra-colors-sun) 58% 92%, transparent 92%)"
          boxDecorationBreak="clone"
          color="ink"
        >
          mapped
        </Box>{' '}
        by{' '}
        <Box as="span" color="brand">
          its community
        </Box>
      </Heading>
      <Text
        fontSize={{ base: 'md', md: 'lg' }}
        color="muted"
        mt={5}
        mb={6}
        maxW="34ch"
      >
        Studios, associations, games and events from around the world, in an
        open database anyone can add to.
      </Text>

      <Form method="get" action="/search" role="search">
        <HStack
          maxW="lg"
          p={1.5}
          bg="surface"
          borderWidth="2px"
          borderColor="ink"
          rounded="xl"
          shadow="pop"
          transition="box-shadow 120ms ease-out"
          _focusWithin={{ shadow: 'popHover' }}
        >
          <Input
            name="q"
            size="lg"
            variant="flushed"
            border="none"
            px={3}
            _focusVisible={{ outline: 'none', boxShadow: 'none' }}
            placeholder="Find a game, studio, association or event"
            aria-label="Search"
          />
          <Button type="submit" size="md" variant="pop">
            <LuSearch />
            Search
          </Button>
        </HStack>
      </Form>

      <HStack
        as="dl"
        gap={{ base: 5, md: 7 }}
        mt={7}
        wrap="wrap"
        aria-label="In the database"
      >
        {[
          [counts.games, 'games'],
          [counts.orgs, 'studios and associations'],
          [counts.events, 'events'],
        ].map(([n, label]) => (
          <Flex key={label} direction="column-reverse">
            <Text
              as="dt"
              fontSize="2xs"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
              color="muted"
              mt={1}
            >
              {label}
            </Text>
            <Text
              as="dd"
              fontFamily="heading"
              fontWeight="800"
              fontSize={{ base: '2xl', md: '3xl' }}
              lineHeight="1"
              letterSpacing="-0.02em"
              fontVariantNumeric="tabular-nums"
            >
              {number(n)}
            </Text>
          </Flex>
        ))}
      </HStack>
    </Box>
    <CoverStory games={games} />
  </Grid>
);

// The invitation to add what's missing, as a sticky note at the end of the
// issue. Only for people who aren't signed in, as the cover.
const Contribute = () => (
  <Grid
    as="aside"
    aria-label="Contribute"
    templateColumns={{ base: '1fr', md: '1fr auto' }}
    gap={5}
    alignItems="center"
    mt={4}
    p={{ base: 6, md: 8 }}
    bg="sun"
    color="onPop"
    borderWidth="2px"
    borderColor="onPop"
    rounded="3xl"
    transform="rotate(-0.6deg)"
  >
    <Box minW={0}>
      <Heading
        as="h2"
        fontSize={{ base: '3xl', md: '4xl' }}
        fontWeight="800"
        letterSpacing="-0.03em"
        lineHeight="1"
      >
        {"Know one we're missing?"}
      </Heading>
      <Text mt={2} maxW="52ch">
        This magazine is written by its readers: add a game, a studio or an
        association, or an event.
      </Text>
      <Text fontSize="sm" mt={2}>
        Adding needs a free account: sign in with Bluesky.
      </Text>
    </Box>
    <Stack direction={{ base: 'column', sm: 'row', md: 'column' }} gap={2}>
      {[
        ['/games/create', 'Add a game'],
        ['/orgs/create', 'Add a studio or association'],
        ['/events/create', 'Add an event'],
      ].map(([to, label], i) => (
        <Button
          key={to}
          size="sm"
          borderWidth="2px"
          borderColor="onPop"
          bg={i === 0 ? 'onPop' : 'transparent'}
          color={i === 0 ? 'sun' : 'onPop'}
          fontWeight="semibold"
          justifyContent="flex-start"
          transition="transform 120ms ease-out, box-shadow 120ms ease-out"
          _hover={{
            transform: 'translate(-2px, -2px)',
            shadow: '4px 4px 0 #10201d',
          }}
          asChild
        >
          <Link to={to}>
            <LuPlus />
            {label}
          </Link>
        </Button>
      ))}
    </Stack>
  </Grid>
);

const TicketGrid = ({ events }) => (
  <Grid
    templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
    gap={4}
    pt={2}
  >
    {events.map((event, i) => (
      <Reveal key={event.id} index={i} minW={0}>
        <EventCard {...event} variant="ticket" />
      </Reveal>
    ))}
  </Grid>
);

// Covers a little off-straight, each its own way; they straighten on hover.
const TILTS = [-1.2, 1, -0.6, 0.8, -1, 1.4];

// The most common tags among the featured games: the filters above them.
const topTags = (games, count = 4) => {
  const tally = new Map();
  for (const game of games) {
    for (const tag of game.tags ?? []) {
      tally.set(tag.name, (tally.get(tag.name) ?? 0) + 1);
    }
  }
  return [...tally]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, count)
    .map(([name]) => name);
};

// The featured games as a wall of covers: the first in the big slot, the
// next two beside it, the rest wide. Tags filter them.
const GameWall = ({ games }) => {
  const tags = useMemo(() => topTags(games), [games]);
  const [tag, setTag] = useState(null);
  const shown = tag
    ? games.filter((game) => game.tags?.some((t) => t.name === tag))
    : games;

  return (
    <>
      {tags.length > 0 && (
        <HStack
          role="group"
          aria-label="Filter games by tag"
          gap={2}
          wrap="wrap"
          mb={4}
        >
          {[null, ...tags].map((name) => {
            const pressed = tag === name;
            return (
              <Button
                key={name ?? 'all'}
                size="xs"
                rounded="full"
                borderWidth="1.5px"
                borderColor={pressed ? 'sun' : 'ink'}
                bg={pressed ? 'sun' : 'transparent'}
                color={pressed ? 'onPop' : 'ink'}
                fontWeight="medium"
                aria-pressed={pressed}
                onClick={() => setTag(name)}
              >
                {name ?? 'Everything'}
              </Button>
            );
          })}
        </HStack>
      )}
      <Grid
        templateColumns={{
          base: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        }}
        gridAutoRows={{ base: '140px', md: '170px' }}
        gridAutoFlow="dense"
        gap={3.5}
      >
        {shown.map((game, i) => (
          <Reveal
            key={game.id}
            index={i}
            minW={0}
            gridColumn={i === 0 || i >= 3 ? 'span 2' : undefined}
            gridRow={i === 0 ? 'span 2' : undefined}
          >
            <GameCard
              {...game}
              variant="cover"
              featured={i === 0}
              tilt={TILTS[i % TILTS.length]}
            />
          </Reveal>
        ))}
      </Grid>
    </>
  );
};

const OrgBadges = ({ orgs }) => (
  <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={3}>
    {orgs.map((org, i) => (
      <Reveal key={org.id} index={i} minW={0}>
        <OrgCard {...org} variant="badge" />
      </Reveal>
    ))}
  </Grid>
);

const HomePage = () => {
  const {
    games,
    studios,
    associations,
    eventsToCome,
    joinedEventsToCome,
    placesCount,
    placesPoints,
    counts,
    currentUser,
  } = useLoaderData();

  return (
    <Page>
      {currentUser ? (
        <VisuallyHidden asChild>
          <h1>Indie Collective Community</h1>
        </VisuallyHidden>
      ) : (
        <Cover counts={counts} games={games} />
      )}

      {joinedEventsToCome.length > 0 && (
        <Department
          kicker="On your calendar"
          title="Your next events"
          to="/events"
          linkLabel="All events"
        >
          <TicketGrid events={joinedEventsToCome} />
        </Department>
      )}

      <Department
        kicker="Agenda"
        title="Upcoming events"
        to="/events"
        linkLabel="Explore events"
      >
        {eventsToCome.length > 0 ? (
          <TicketGrid events={eventsToCome} />
        ) : (
          <Box my={5} width={['auto', '50%', '35%', '25%']} mx="auto">
            <Image src={noEventsImage} alt="" />
            <Text fontSize="xl" mt={5} textAlign="center">
              No upcoming events
              <br />
              <small>(yet)</small>
            </Text>
          </Box>
        )}
      </Department>

      <Department
        kicker="Recently updated"
        title="Games"
        to="/games"
        linkLabel="Explore games"
      >
        <GameWall games={games} />
      </Department>

      <Department
        kicker="Atlas"
        title="Map"
        to="/places"
        linkLabel="Open the map"
      >
        <PlacesWidget placesCount={placesCount} placesPoints={placesPoints} />
      </Department>

      {/* minW 0: grid items otherwise can't shrink below their content,
          which pushed the page past a 375px screen. */}
      <Grid
        gap={{ base: 0, lg: 8 }}
        templateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']}
      >
        <Department
          kicker="Who makes them"
          title="Studios"
          to="/studios"
          linkLabel="Explore studios"
        >
          <OrgBadges orgs={studios} />
        </Department>
        <Department
          kicker="Who brings people together"
          title="Associations"
          to="/associations"
          linkLabel="Explore associations"
        >
          <OrgBadges orgs={associations} />
        </Department>
      </Grid>

      {!currentUser && <Contribute />}
    </Page>
  );
};

export default HomePage;
