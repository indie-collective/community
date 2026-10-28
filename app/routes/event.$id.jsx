import {
  AspectRatio,
  Image,
  Box,
  Grid,
  Heading,
  Text,
  AvatarGroup,
  Avatar,
  Button,
  Stack,
  IconButton,
  useDisclosure,
  Wrap,
  Link as ChakraLink,
  Dialog,
  Portal,
  HStack,
  List,
} from '@chakra-ui/react';
import {
  LuPlus,
  LuTriangleAlert,
  LuMapPin,
  LuExternalLink,
  LuTicket,
  LuCalendar,
  LuGlobe,
} from 'react-icons/lu';
import {
  Form,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from 'react-router';
import Link from '../components/Link';

import PlaceMap from '../components/PlaceMap';
import ShareMenu from '../components/ShareMenu';
import OpportunityList from '../components/OpportunityList';
import { listOpportunities } from '../data/opportunities.server';
import { isFeatureOn } from '../data/featureFlags.server';
import { isFollowing } from '../data/notifications.server';
import FollowButton from '../components/FollowButton';
import SourceCredit from '../components/SourceCredit';
import { listRecordSources } from '../data/sources.server';
import { ReportDuplicate } from '../components/Duplicates';
import { AddToCalendar } from '../components/CalendarMenus';
import VisitorTime from '../components/VisitorTime';
import { pinColor } from '../utils/orgTypes';

import {
  getEvent,
  getEventEditions,
  getRelatedEvents,
} from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import usePlaceholder from '../hooks/usePlaceholder';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import Markdown from '../components/Markdown';
import RelatedEvents from '../components/RelatedEvents';
import DateLabel from '../components/DateLabel';
import JoinEventButton from '../components/JoinEventButton';
import { SearchGameModal } from './search-game';
// Named, not default: React Router wraps a route module's default export and
// drops the props passed to it here.
import { SearchOrgModal } from './search-org';
import SectionHeading from '../components/SectionHeading';
import ActionMenu from '../components/ActionMenu';
import { Page, PageHeader, PageSection } from '../components/Page';
import countryNames from '../assets/countries.json';
import { formatEventDate, formatEventRange } from '../utils/eventTime';
import { pageMeta, shareImage, summarize } from '../utils/meta';
import EmptyHint from '../components/EmptyHint';
import { pageRecordId } from '../utils/pageRecord.server';
import { eventPath } from '../utils/slug';
import { useLanguage } from '../i18n';

export const loader = async ({ request, params }) => {
  // By slug, an old slug or UUID; those redirect to the slug (#209).
  const id = await pageRecordId('event', request, params.id);

  const currentUser = await isAuthenticated(request);

  const event = await getEvent(id);

  if (!event)
    throw new Response('Not Found', {
      status: 404,
    });

  // #203: the series it belongs to; other events named alike come after.
  const editions = await getEventEditions(id);
  const data = {
    event,
    editions,
    relatedEvents: await getRelatedEvents(event, {
      excludeIds: editions.map((edition) => edition.id),
    }),
    currentUser,
    // Behind their feature flag (/admin/flags).
    opportunities: (await isFeatureOn('opportunities', currentUser)) ? await listOpportunities({ eventId: id }) : null,
    following: await isFollowing(currentUser?.id, 'event', id),
    // #338: where some of it came from.
    sources: await listRecordSources('event', id),
  };

  return data;
};

export const meta = ({ data, matches }) => {
  if (!data?.event)
    return [
      {
        title: 'Event not found!',
      },
    ];
  const { event } = data;
  let description = `Event on ${formatEventDate(event.starts_at, event.time_zone)}`;
  if (event.location) {
    const l = event.location;
    description += ` in ${l.street ? l.street + ', ' : ''}${l.city}, ${
      l.region
    }, ${l.country_code}`;
  }
  return pageMeta(matches, {
    title: `${event.name} | Events`,
    shareTitle: event.name,
    description: summarize(event.about) || description,
    image: shareImage(event.cover, event.name),
    path: eventPath(event),
  });
};

const Event = () => {
  const { event, editions, relatedEvents, currentUser, opportunities, following, sources } = useLoaderData();
  const fetcher = useFetcher();
  const placeholder = usePlaceholder();
  const language = useLanguage();
  const {
    open: linkGameIsOpen,
    onOpen: onOpenLinkGame,
    onClose: onCloseLinkGame,
  } = useDisclosure();
  const {
    open: linkHostIsOpen,
    onOpen: onOpenLinkHost,
    onClose: onCloseLinkHost,
  } = useDisclosure();

  const deleteModal = useDisclosure();
  // #346
  const reportModal = useDisclosure();

  const {
    id,
    name,
    status,
    about,
    site,
    ticket_url: ticketUrl,
    attendance,
    online_url: onlineUrl,
    starts_at: startsAt,
    time_zone: timeZone,
    ends_at: endsAt,
    location,
    game_event,
    entity_event,
    event_participant,
    cover,
  } = event;

  const games = game_event.map(({ game }) => game);
  const entities = entity_event.map(({ entity }) => entity);
  const participants = event_participant.map(({ person }) => person);

  const isGoing =
    currentUser && participants.some(({ id }) => id === currentUser.id);

  const isPast = new Date(endsAt) < new Date();
  const place = location
    ? [
        location.city,
        countryNames[location.country_code] ?? location.country_code,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <Page>
      <Box position="relative" mb={{ base: 5, md: 6 }}>
        <AspectRatio ratio={3}>
          <Image
            objectFit="cover"
            src={cover?.url ?? placeholder}
            alt=""
            borderRadius="xl"
            // The clicked card's image moves here (view transitions, CardLink).
            data-vt-hero=""
            css={{ viewTransitionName: 'record-image' }}
          />
        </AspectRatio>
        <DateLabel
          position="absolute"
          right={3}
          bottom={3}
          value={new Date(startsAt)}
          timeZone={timeZone}
        />
      </Box>

      <PageHeader
        // What kind of page this is, and where (design pass).
        eyebrow={[
          'Event',
          status === 'canceled' ? 'Canceled' : isPast ? 'Past' : 'Upcoming',
          place ?? (attendance === 'online' ? 'Online' : null),
        ]
          .filter(Boolean)
          .join(' · ')}
        title={
          <Text
            as="span"
            textDecoration={status === 'canceled' ? 'line-through' : undefined}
          >
            {name}
          </Text>
        }
        actions={
          <>
            <ShareMenu title={name} path={eventPath(event)} />
            {currentUser && <FollowButton type="event" id={id} following={following} />}
            {!isPast && status !== 'canceled' && (
              <AddToCalendar
                event={event}
                path={eventPath(event)}
                place={location ? [location.street, location.city].filter(Boolean).join(', ') : null}
              />
            )}
            {currentUser && (
              <>
                {status !== 'canceled' && (
                  <JoinEventButton
                    size="sm"
                    minWidth={100}
                    eventId={id}
                    isGoing={isGoing}
                  >
                    {isPast
                      ? isGoing
                        ? 'Went'
                        : 'I went!'
                      : isGoing
                        ? 'Going'
                        : "Let's go!"}
                  </JoinEventButton>
                )}
                <ActionMenu
                  editLink={`/event/${id}/edit`}
                  onDelete={currentUser.isAdmin ? deleteModal.onOpen : undefined}
                onReportDuplicate={reportModal.onOpen}
                />
              </>
            )}
          </>
        }
      >
        <Stack gap={1} color="muted">
          <HStack gap={2}>
            <LuCalendar />
            <Text asChild>
              <time
                dateTime={`${new Date(startsAt).toISOString()}/${new Date(endsAt).toISOString()}`}
              >
                {/* In the event's own time zone, identical on server and browser (#204). */}
                {formatEventRange(startsAt, endsAt, timeZone, { locale: language })}
              </time>
            </Text>
          </HStack>
          <Box ps={6}>
            <VisitorTime startsAt={startsAt} endsAt={endsAt} timeZone={timeZone} />
          </Box>
          {attendance !== 'in_person' && (
            <HStack gap={2}>
              <LuGlobe />
              <Text>
                {attendance === 'online' ? 'Online' : 'Also online'}
                {onlineUrl && (
                  <>
                    {' · '}
                    <ChakraLink href={onlineUrl} target="_blank" rel="noopener noreferrer">
                      Join online
                      <LuExternalLink />
                    </ChakraLink>
                  </>
                )}
              </Text>
            </HStack>
          )}
          {location && (
            <HStack gap={2} align="flex-start">
              <Box as="span" mt="3px">
                <LuMapPin />
              </Box>
              <Text>
                {[location.street, location.city, location.region]
                  .filter(Boolean)
                  .join(', ')}
                {(location.street || location.city || location.region) && ', '}
                <ChakraLink asChild>
                  <Link to={`/country/${location.country_code.toLowerCase()}`}>
                    {countryNames[location.country_code] ??
                      location.country_code}
                  </Link>
                </ChakraLink>
              </Text>
            </HStack>
          )}
        </Stack>
        {(site || ticketUrl) && (
          <HStack gap={2} wrap="wrap" mt={2}>
            {site && (
              <Button size="sm" variant="outline" asChild>
                <a href={site} target="_blank" rel="noopener noreferrer">
                  <LuExternalLink />
                  Website
                </a>
              </Button>
            )}
            {ticketUrl && status !== 'canceled' && (
              <Button size="sm" asChild>
                <a href={ticketUrl} target="_blank" rel="noopener noreferrer">
                  <LuTicket />
                  Tickets
                </a>
              </Button>
            )}
          </HStack>
        )}
        {participants.length > 0 && (
          <HStack gap={3} mt={2}>
            <AvatarGroup size="sm">
              {participants.map(({ id, username, avatar }) => {
                const picture = (
                  <>
                    <Avatar.Fallback name={username} />
                    <Avatar.Image src={avatar && avatar.thumbnail_url} />
                  </>
                );
                // #341: to their profile, which links their Bluesky (#161).
                return (
                  <Avatar.Root key={id} title={`@${username}`} asChild>
                    <Link to={`/people/${username}`} aria-label={`@${username}`}>
                      {picture}
                    </Link>
                  </Avatar.Root>
                );
              })}
            </AvatarGroup>
            <Text fontSize="sm" color="muted">
              {participants.length}{' '}
              {status === 'canceled'
                ? 'were attending'
                : isPast
                  ? 'went'
                  : 'attending'}
            </Text>
          </HStack>
        )}
      </PageHeader>

      {status === 'canceled' && (
        <HStack
          gap={3}
          p={4}
          mb={{ base: 8, md: 10 }}
          bg="red.subtle"
          color="red.fg"
          borderRadius="lg"
          role="status"
        >
          <LuTriangleAlert />
          <Text fontWeight="semibold">This event was canceled.</Text>
        </HStack>
      )}

      {location && location.longitude && location.latitude && (
        <PlaceMap
          location={location}
          id={id}
          color={pinColor('event')}
          label={place || name}
          address={[location.street, location.city].filter(Boolean).join(', ')}
        />
      )}

      {about && (
        <Box as="section" mb={{ base: 8, md: 10 }} maxW="2xl">
          <Heading as="h2" size="xl" mb={4}>
            About
          </Heading>
          <Markdown value={about} />
          <SourceCredit sources={sources} field="about" value={about} />
        </Box>
      )}

      {(currentUser || games.length > 0) && (
        <Box as="section" mb={{ base: 8, md: 10 }}>
          <SectionHeading mb={4} count={games.length} countLabel="games">
            Games
          </SectionHeading>
          <Wrap gap={2}>
            {games.map((game) => (
              <Box key={game.id} position="relative">
                <GameCard
                  id={game.id}
                  {...game}
                  onRemove={
                    currentUser
                      ? () =>
                          fetcher.submit(
                            { id: game.id },
                            {
                              method: 'post',
                              action: `/event/${id}/games/delete`,
                            }
                            // { method: 'post', action: './games/delete' }
                          )
                      : null
                  }
                  isCompact
                />
              </Box>
            ))}
            {currentUser && games.length === 0 && (
              <EmptyHint>Which games were shown here? Add them.</EmptyHint>
            )}
            {currentUser && (
              <>
                <IconButton
                  colorPalette="green"
                  aria-label="Add a game to the event"
                  onClick={onOpenLinkGame}
                >
                  <LuPlus />
                </IconButton>
                <SearchGameModal
                  isOpen={linkGameIsOpen}
                  onClose={onCloseLinkGame}
                  excludedIds={games.map(({ id }) => id)}
                  onSelect={(game) => {
                    fetcher.submit(
                      { id: game.id },
                      {
                        method: 'post',
                        action: `/event/${id}/games/add`,
                      }
                      // { method: 'post', action: './games/add' }
                    );
                  }}
                />
              </>
            )}
          </Wrap>
        </Box>
      )}

      {(currentUser || entities.length > 0) && (
        <Box as="section" mb={{ base: 8, md: 10 }}>
          <Heading as="h2" size="xl" mb={4}>
            Organizers
          </Heading>

          <Grid
            gap={5}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
            ]}
          >
            {entities.map((host) => (
              <OrgCard
                key={host.id}
                {...host}
                onRemove={
                  currentUser
                    ? () =>
                        fetcher.submit(
                          { id: host.id },
                          {
                            method: 'post',
                            action: `/event/${id}/hosts/delete`,
                          }
                          // { method: 'post', action: './hosts/delete' }
                        )
                    : null
                }
              />
            ))}
            {currentUser && entities.length === 0 && (
              <EmptyHint>
                Who organises it? Add a studio or association.
              </EmptyHint>
            )}
            {currentUser && (
              <>
                <IconButton
                  alignSelf="center"
                  justifySelf="flex-start"
                  colorPalette="green"
                  aria-label="Add a host to the event"
                  onClick={onOpenLinkHost}
                >
                  <LuPlus />
                </IconButton>
                <SearchOrgModal
                  isOpen={linkHostIsOpen}
                  onClose={onCloseLinkHost}
                  excludedIds={entities.map(({ id }) => id)}
                  onSelect={(host) => {
                    fetcher.submit(
                      { id: host.id },
                      { method: 'post', action: `/event/${id}/hosts/add` }
                      // { method: 'post', action: './hosts/add' }
                    );
                  }}
                />
              </>
            )}
          </Grid>
        </Box>
      )}

      {editions.length > 1 && (
        <Box as="section" mb={{ base: 8, md: 10 }}>
          <Heading as="h2" size="xl" mb={4}>
            Editions
          </Heading>
          <List.Root variant="plain" gap={1}>
            {editions.map((edition) => (
              <List.Item key={edition.id}>
                {edition.id === id ? (
                  <Text fontWeight="bold">
                    {edition.name}{' '}
                    <Text as="span" color="muted" fontWeight="normal">
                      (this one)
                    </Text>
                  </Text>
                ) : (
                  <ChakraLink asChild>
                    <Link to={eventPath(edition)}>{edition.name}</Link>
                  </ChakraLink>
                )}
                <Text as="span" color="muted" ml={2} fontSize="sm">
                  {formatEventRange(
                    edition.starts_at,
                    edition.ends_at,
                    edition.time_zone,
                    { time: false, locale: language }
                  )}
                </Text>
              </List.Item>
            ))}
          </List.Root>
        </Box>
      )}
      {relatedEvents.length > 0 && (
        <Box as="section" mb={{ base: 8, md: 10 }}>
          <Heading as="h2" size="xl" mb={4}>
            Related events
          </Heading>

          <RelatedEvents events={relatedEvents} />
        </Box>
      )}
      {currentUser && (
        <Box>
          <Dialog.Root
            open={deleteModal.open}
            onOpenChange={(e) => {
              if (!e.open) {
                deleteModal.onClose();
              }
            }}
          >
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content action={`./delete`} method="post" asChild>
                  <Form>
                    <Dialog.Header>Delete Event</Dialog.Header>
                    <Dialog.CloseTrigger />
                    <Dialog.Body>
                      <Text>Do you really want to delete {name}?</Text>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Button
                        type="submit"
                        loading={false}
                        loadingText="Deleting"
                        colorPalette="red"
                        mr={3}
                      >
                        Delete
                      </Button>
                      <Button variant="ghost" onClick={deleteModal.onClose}>
                        Cancel
                      </Button>
                    </Dialog.Footer>
                  </Form>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Box>
      )}
      {/* #345: what it's looking for. */}
      {opportunities && (opportunities.length > 0 || currentUser) && (
        <PageSection
          title="Opportunities"
          aside={
            currentUser && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/opportunities/new?for=event:${id}`}>Post an opportunity</Link>
              </Button>
            )
          }
        >
          {opportunities.length > 0 ? (
            <OpportunityList opportunities={opportunities} currentUser={currentUser} showFor={false} />
          ) : (
            <EmptyHint>Hiring, looking for playtesters or pitches? Post it here.</EmptyHint>
          )}
        </PageSection>
      )}
      {currentUser && (
        <ReportDuplicate kind="event" id={id} isOpen={reportModal.open} onClose={reportModal.onClose} />
      )}
    </Page>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Stack textAlign="center" mt={20}>
        <Heading>Event not found!</Heading>
        <Text>Would you like to create its page?</Text>
        <Box mt={10}>
          <Button m="auto" mb={10} size="lg" asChild>
            <Link to="/events/create">
              <LuPlus />
              Add an event
            </Link>
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default Event;
