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
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Wrap,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, WarningTwoIcon } from '@chakra-ui/icons';
import {
  Form,
  Link,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { json } from '@remix-run/node';
import { Map } from 'pigeon-maps';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import { getFullTextSearchQuery } from '../utils/search.server';
import computeEvent from '../models/event';
import usePlaceholder from '../hooks/usePlaceholder';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import Markdown from '../components/Markdown';
import RelatedEvents from '../components/RelatedEvents';
import DateLabel from '../components/DateLabel';
import JoinEventButton from '../components/JoinEventButton';
import { LocationIcon } from '../components/LocationIcon';
import { SearchGameModal } from './search-game';
import SearchOrgModal from './search-org';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const currentUser = await authenticator.isAuthenticated(request);

  const event = await db.event.findUnique({
    where: { id },
    include: {
      entity_event: {
        include: {
          entity: {
            include: {
              logo: true,
            },
          },
        },
      },
      game_event: {
        where: {
          game: {
            deleted: false,
          },
        },
        include: {
          game: {
            include: {
              game_image: {
                include: {
                  image: true,
                },
              },
            },
          },
        },
      },
      event_participant: {
        include: {
          person: {
            include: {
              avatar: true,
            },
          },
        },
      },
      cover: true,
      location: true,
    },
  });

  if (!event)
    throw new Response('Not Found', {
      status: 404,
    });

  const relatedEvents = await db.event.findMany({
    where: {
      name: {
        search: getFullTextSearchQuery(event.name),
      },
      id: {
        not: id,
      },
    },
    include: {
      cover: true,
      game_event: {
        where: {
          game: {
            deleted: false,
          },
        },
      },
      event_participant: true,
    },
    take: 5,
  });

  const data = {
    event: await computeEvent(event),
    // todo: externalize to defer this?
    relatedEvents: await Promise.all(relatedEvents.map(computeEvent)),
    currentUser,
  };

  return json(data);
};

export const meta = ({ data, location }) => {
  if (!data?.event) return { title: 'Event not found!' };

  const { event } = data;

  let description = `Event on ${new Date(event.starts_at).toLocaleString(
    'en-US',
    {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
    }
  )}`;

  if (event.location) {
    const l = event.location;

    description += ` in ${l.street ? l.street + ', ' : ''}${l.city}, ${l.region
      }, ${l.country_code}`;
  }

  return {
    title: `${event.name} | Events`,
    description,
    'og:title': event.name,
    'og:description': description,
    'og:url': `${location.protocol}://${location.host}/org/${event.id}`,
    'og:image': event.cover?.thumbnail_url,
    'twitter:card': event.cover ? 'summary_large_image' : 'summary',
    'twitter:title': event.name,
    'twitter:description': description,
    'twitter:image': event.cover?.thumbnail_url,
  };
};

const Event = () => {
  const { event, relatedEvents, currentUser } = useLoaderData();
  const fetcher = useFetcher();
  const placeholder = usePlaceholder();
  const {
    isOpen: linkGameIsOpen,
    onOpen: onOpenLinkGame,
    onClose: onCloseLinkGame,
  } = useDisclosure();
  const {
    isOpen: linkHostIsOpen,
    onOpen: onOpenLinkHost,
    onClose: onCloseLinkHost,
  } = useDisclosure();

  const deleteModal = useDisclosure();

  const {
    id,
    name,
    status,
    about,
    site,
    starts_at: startsAt,
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

  const dateTimeFormat = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  return (
    <Grid
      templateColumns={['1fr', '1fr', '1fr']}
      gap={[5, 5, 10]}
      mt={[5, 2, 5]}
      mx={5}
    >
      <Box>
        <Box position="relative">
          <AspectRatio ratio={3}>
            <Image
              size="100%"
              objectFit="cover"
              src={cover && cover.url}
              alt="Event cover"
              fallbackSrc={placeholder}
              rounded={5}
            />
          </AspectRatio>

          <DateLabel
            position="absolute"
            right={2}
            bottom={3}
            value={new Date(startsAt)}
          />
        </Box>

        <Box
          mb={5}
          roundedBottom={5}
          minHeight={!location && '100px'}
        >
          <Grid
            gridTemplateColumns={['1fr', '1fr auto auto']}
            columnGap={2}
            padding={2}
            color={status === 'canceled' && 'gray.500'}
          >
            {currentUser && (
              <Link to={`/event/${id}/edit`}>
                <Button
                  gridRow={['', '1']}
                  gridColumn={[
                    '',
                    status === 'canceled' ? '2 / span 2' : '2 / span 1',
                  ]}
                  mb={[2, '0']}
                  leftIcon={<EditIcon />}
                  size="sm"
                  colorScheme="green"
                >
                  Edit
                </Button>
              </Link>
            )}

            <Heading
              size="2xl"
              gridColumn="1"
              gridRow={['', !location && '3']}
              textDecoration={status === 'canceled' && 'line-through'}
            >
              {name}
            </Heading>

            <Text
              gridColumn="1"
              textTransform="uppercase"
              as="time"
              dateTime={startsAt + '/' + endsAt}
              whiteSpace="nowrap"
            >
              {dateTimeFormat.formatRange(new Date(startsAt), new Date(endsAt))}
            </Text>

            {location && (
              <Text gridColumn="1">
                <LocationIcon /> {location.street && `${location.street}, `}
                {location.city}, {location.region},{' '}
                <ChakraLink
                  as={Link}
                  to={`/country/${location.country_code.toLowerCase()}`}
                >
                  {location.country_code}
                </ChakraLink>
              </Text>
            )}

            {location && location.longitude && location.latitude && (
              <Box
                gridColumn={[1, '1 / span 3']}
                height={['80px', '150px']}
                overflow="hidden"
                rounded={5}
                marginX={-2}
                mb={[2, -2]}
                mt={[2]}
              >
                <Map
                  defaultWidth={1200}
                  defaultHeight={150}
                  center={[location.latitude, location.longitude]}
                  zoom={location.street ? 16 : 11}
                  mouseEvents={false}
                  touchEvents={false}
                ></Map>
              </Box>
            )}

            <Box
              textAlign="right"
              pt={2}
              gridColumn={['', '2 / 4']}
              gridRow={['', '2 / span 2']}
              alignSelf={['', 'flex-end']}
              display={['flex', 'block']}
              flexDirection={['row-reverse', '']}
            >
              <AvatarGroup size="md" max={3} justifyContent="end">
                {participants.map(({ id, username, avatar }) => (
                  <Avatar
                    key={id}
                    name={username}
                    src={avatar && avatar.thumbnail_url}
                    title={`@${username}`}
                  />
                ))}
              </AvatarGroup>
              <Text>
                {status !== 'canceled' &&
                  (new Date(endsAt) < new Date() ? 'went' : 'attending')}
                {status === 'canceled' && 'was attending'}
              </Text>
            </Box>

            {currentUser && status !== 'canceled' && (
              <JoinEventButton
                mt={[2, '0']}
                gridRow={['', '1']}
                gridColumn={['', '3']}
                size="sm"
                minWidth={100}
                eventId={id}
                isGoing={isGoing}
              >
                {new Date(endsAt) < new Date()
                  ? isGoing
                    ? 'Went'
                    : 'I went!'
                  : isGoing
                    ? 'Going'
                    : "Let's go!"}
              </JoinEventButton>
            )}
          </Grid>
        </Box>

        {status === 'canceled' && (
          <Stack
            isInline
            p={5}
            m={[2, 0]}
            mb={[5, 5]}
            backgroundColor="red.300"
            borderRadius={5}
          >
            <WarningTwoIcon size="24px" color="white" />
            <Text as="b" color="white">
              This event was canceled.
            </Text>
          </Stack>
        )}

        {about && (
          <Box
            m={[2, 0]}
            mb={[5, 5]}
            borderWidth="1px"
            borderRadius={5}
            padding={2}
          >
            <Heading as="h3" fontSize="2xl">
              Description
            </Heading>
            <Markdown value={about} />
          </Box>
        )}

        {(currentUser || games.length > 0) && (
          <Box m={[2, 0]} mb={[5, 5]}>
            <Heading size="md" mb={2}>
              Games
              <Badge
                verticalAlign="baseline"
                fontSize="md"
                ml={2}
                variant="subtle"
                colorScheme="green"
              >
                {games.length}
              </Badge>
            </Heading>
            <Wrap spacing={2}>
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
              {currentUser && (
                <>
                  <IconButton
                    colorScheme="green"
                    aria-label="Add a game to the event"
                    icon={<AddIcon />}
                    onClick={onOpenLinkGame}
                  />
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
          <Box m={[2, 0]} mb={[5, 5]}>
            <Heading size="md" mb={2}>
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
              {currentUser && (
                <>
                  <IconButton
                    alignSelf="center"
                    justifySelf="flex-start"
                    colorScheme="green"
                    aria-label="Add a host to the event"
                    icon={<AddIcon />}
                    onClick={onOpenLinkHost}
                  />
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

        {currentUser && (
          <Box mb={5}>
            <Button
              variant="link"
              colorScheme="red"
              onClick={deleteModal.onOpen}
            >
              Delete event
            </Button>

            <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
              <ModalOverlay />
              <ModalContent as={Form} action={`./delete`} method="post">
                <ModalHeader>Delete Event</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Do you really want to delete {name}?</Text>
                </ModalBody>

                <ModalFooter>
                  <Button
                    type="submit"
                    isLoading={false}
                    loadingText="Deleting"
                    colorScheme="red"
                    mr={3}
                  >
                    Delete
                  </Button>
                  <Button variant="ghost" onClick={deleteModal.onClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        )}
      </Box>

      <Box m={[2, 0]}>
        <Heading>Related events</Heading>

        <RelatedEvents events={relatedEvents} />
      </Box>
    </Grid>
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
          <Button
            as={Link}
            to="/events/create"
            m="auto"
            mb={10}
            size="lg"
            leftIcon={<AddIcon />}
          >
            Add an event
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default Event;
