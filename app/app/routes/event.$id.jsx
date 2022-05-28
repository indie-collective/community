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
  useToast,
  Wrap,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Map } from 'pigeon-maps';

import { db } from '../utils/db.server';
import usePlaceholder from '../hooks/usePlaceholder';
import Navigation from '../components/Navigation';
import GameCard from '../components/GameCard';
import OrgCard from '../components/OrgCard';
import Markdown from '../components/Markdown';
import RelatedEvents from '../components/RelatedEvents';
import DateLabel from '../components/DateLabel';
import JoinEventButton from '../components/JoinEventButton';
import { SearchGameModal } from './search-game';
import SearchOrgModal from './search-org';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const event = await db.event.findUnique({
    where: { id },
    include: {
      entity_event: {
        include: {
          entity: true,
        },
      },
      game_event: {
        include: {
          game: true,
        },
      },
      event_participant: {
        include: {
          person: true,
        },
      },
      cover: true,
      location: true,
    },
  });

  const data = {
    event,
    // todo: externalize to defer this?
    relatedEvents: await db.event.findMany({
      where: {
        name: {
          search: event.name.split(' ').join(' | '),
        },
      },
      include: {
        game_event: true,
        event_participant: true,
      },
      take: 5,
    }),
    currentUser: await db.person.findFirst(),
  };

  return json(data);
};

export const meta = ({ data, location }) => {
  let description = `Event on ${new Date(data.starts_at).toLocaleString(
    'en-US',
    {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
    }
  )}`;

  if (data.location) {
    const l = data.location;

    description += ` in ${l.street ? l.street + ', ' : ''}${l.city}, ${
      l.region
    }, ${l.country_code}`;
  }

  const { event } = data;

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
  const toast = useToast();
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

  return (
    <div>
      <Navigation />

      <Grid
        templateColumns={['1fr', '1fr', '3fr 1fr']}
        gap={[5, 5, 10]}
        mt={[5, 2, 5]}
        padding={[0, 5]}
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
            borderWidth={['', '1px']}
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
                    colorScheme="teal"
                  >
                    Edit
                  </Button>
                </Link>
              )}

              <Text
                gridColumn="1"
                textTransform="uppercase"
                as="time"
                dateTime={startsAt}
                whiteSpace="nowrap"
              >
                {new Date(startsAt).toLocaleString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: 'numeric',
                })}{' '}
                -{' '}
                {new Date(endsAt).toLocaleString(
                  undefined,
                  new Date(startsAt).getDay() === new Date(endsAt).getDay()
                    ? {
                        hour: 'numeric',
                        minute: 'numeric',
                      }
                    : {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: 'numeric',
                      }
                )}
              </Text>

              <Heading
                gridColumn="1"
                gridRow={['', !location && '3']}
                textDecoration={status === 'canceled' && 'line-through'}
              >
                {name}
              </Heading>

              {location && (
                <Text gridColumn="1">
                  {location.street && `${location.street}, `}
                  {location.city}, {location.region}, {location.country_code}
                </Text>
              )}

              {location && location.longitude && location.latitude && (
                <Box
                  gridColumn={[1, '1 / span 3']}
                  height={['80px', '150px']}
                  overflow="hidden"
                  roundedBottom={[0, 5]}
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
                <AvatarGroup size="xs" max={3} justifyContent="end">
                  {participants.map(({ id, first_name, avatar }) => (
                    <Avatar
                      key={id}
                      name={first_name}
                      src={avatar && avatar.thumbnail_url}
                    />
                  ))}
                </AvatarGroup>
                <Text>
                  {participants.length}{' '}
                  {status !== 'canceled' &&
                    (new Date(endsAt) < new Date() ? 'went' : 'going')}
                  {status === 'canceled' && 'were going'}
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
                  colorScheme="teal"
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
                              removeGameFromEvent({
                                variables: { eventId: id, gameId: game.id },
                                optimisticResponse: {
                                  __typename: 'Mutation',
                                  deleteGameEvent: {
                                    __typename: 'DeleteGameEventMutation',
                                    game: { __typename: 'Game', ...game },
                                  },
                                },
                              })
                          : null
                      }
                      isCompact
                    />
                  </Box>
                ))}
                {currentUser && (
                  <>
                    <IconButton
                      colorScheme="teal"
                      aria-label="Add a game to the event"
                      icon={<AddIcon />}
                      onClick={onOpenLinkGame}
                    />
                    <SearchGameModal
                      isOpen={linkGameIsOpen}
                      onClose={onCloseLinkGame}
                      excludedIds={games.map(({ id }) => id)}
                      onSelect={(game) => {}
                        // addGameToEvent({
                        //   variables: { eventId: id, gameId: game.id },
                        //   optimisticResponse: {
                        //     __typename: 'Mutation',
                        //     createGameEvent: {
                        //       __typename: 'CreateGameEventMutation',
                        //       game: { __typename: 'Game', ...game },
                        //     },
                        //   },
                        // })
                      }
                    />
                  </>
                )}
              </Wrap>
            </Box>
          )}

          {(currentUser || entities.length > 0) && (
            <Box m={[2, 0]} mb={[5, 5]}>
              <Heading size="md" mb={2}>
                Hosts
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
                            removeHostFromEvent({
                              variables: { eventId: id, hostId: host.id },
                              optimisticResponse: {
                                __typename: 'Mutation',
                                deleteEntityEvent: {
                                  __typename: 'DeleteEntityEventMutation',
                                  entity: { __typename: 'Entity', ...host },
                                },
                              },
                            })
                        : null
                    }
                  />
                ))}
                {currentUser && (
                  <>
                    <IconButton
                      alignSelf="center"
                      justifySelf="flex-start"
                      colorScheme="teal"
                      aria-label="Add a host to the event"
                      icon={<AddIcon />}
                      onClick={onOpenLinkHost}
                    />
                    <SearchOrgModal
                      isOpen={linkHostIsOpen}
                      onClose={onCloseLinkHost}
                      excludedIds={entities.map(({ id }) => id)}
                      onSelect={(host) => {}
                        // addHostToEvent({
                        //   variables: { eventId: id, hostId: host.id },
                        //   optimisticResponse: {
                        //     __typename: 'Mutation',
                        //     createEntityEvent: {
                        //       __typename: 'CreateEntityEventMutation',
                        //       entity: { __typename: 'Entity', ...host },
                        //     },
                        //   },
                        // })
                      }
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
                <ModalContent>
                  <ModalHeader>Delete Event</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Text>Do you really want to delete {name}?</Text>
                  </ModalBody>

                  <ModalFooter>
                    <Form method="POST" action={`./delete`}>
                      <Button
                        type='submit'
                        isLoading={false}
                        loadingText="Deleting"
                        colorScheme="red"
                        mr={3}
                      >
                        Delete
                      </Button>
                    </Form>
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
    </div>
  );
};

export default Event;
