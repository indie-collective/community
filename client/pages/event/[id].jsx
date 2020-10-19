import { gql, useQuery, useMutation } from '@apollo/client';
import Head from 'next/head';
import Link from 'next/link';
import {
  AspectRatioBox,
  Image,
  Box,
  Grid,
  Heading,
  Text,
  Spinner,
  AvatarGroup,
  Avatar,
  Button,
  Stack,
  IconButton,
  useDisclosure,
  Badge,
} from '@chakra-ui/core';
import Map from 'pigeon-maps';
import Error from 'next/error';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import OrgCard from '../../components/OrgCard';
import Markdown from '../../components/Markdown';
import RelatedEvents from '../../components/RelatedEvents';
import usePlaceholder from '../../hooks/usePlaceholder';
import DateLabel from '../../components/DateLabel';
import useCurrentPerson from '../../hooks/useCurrentPerson';
import JoinEventButton from '../../components/JoinEventButton';
import SearchGameModal from '../../components/SearchGameModal';
import SearchOrgModal from '../../components/SearchOrgModal';

const eventQuery = gql`
  ${GameCard.fragments.game}
  ${OrgCard.fragments.org}

  query event($id: UUID!) {
    event(id: $id) {
      id
      name
      cover {
        thumbnail_url
        url
      }
      about
      site
      startsAt
      endsAt

      location {
        id
        street
        city
        region
        countryCode
        latitude
        longitude
      }

      participants {
        totalCount
        nodes {
          id
          avatar {
            thumbnail_url
          }
        }
      }

      games {
        totalCount
        nodes {
          id
          ...GameCardGame
        }
      }

      entities {
        totalCount
        nodes {
          id
          ...OrgCardOrg
        }
      }
    }
  }
`;

const addGameToEventMutation = gql`
  ${GameCard.fragments.game}

  mutation addGameToEvent($eventId: UUID!, $gameId: UUID!) {  
    createGameEvent(
      input: { gameEvent: { eventId: $eventId, gameId: $gameId } }
    ) {
      game {
        id
        ...GameCardGame
      }
    }
  }
`;

const removeGameFromEventMutation = gql`
  mutation removeGameFromEvent($eventId: UUID!, $gameId: UUID!) {
    deleteGameEvent(input: { eventId: $eventId, gameId: $gameId }) {
      game {
        id
      }
    }
  }
`;

const addHostToEventMutation = gql`
  ${OrgCard.fragments.org}

  mutation addHostToEvent($eventId: UUID!, $hostId: UUID!) {
    createEntityEvent(
      input: { entityEvent: { eventId: $eventId, entityId: $hostId } }
    ) {
      entity {
        id
        ...OrgCardOrg
      }
    }
  }
`;

const removeHostFromEventMutation = gql`
  mutation removeHostFromEvent($eventId: UUID!, $hostId: UUID!) {
    deleteEntityEvent(input: { eventId: $eventId, entityId: $hostId }) {
      entity {
        id
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Event = ({ id, host }) => {
  const validId = uuidRegex.test(id);

  const placeholder = usePlaceholder();
  const currentPerson = useCurrentPerson();
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
  const { loading, error, data, refetch } = useQuery(eventQuery, {
    variables: { id },
    skip: !validId,
  });
  const [addGameToEvent] = useMutation(addGameToEventMutation, {
    update(cache, { data: { createGameEvent } }) {
      cache.modify({
        id: cache.identify(data.event),
        fields: {
          games(gamesRef) {
            const newGameRef = cache.writeFragment({
              fragment: GameCard.fragments.game,
              data: createGameEvent.game,
            });

            return {
              ...gamesRef,
              nodes: [...gamesRef.nodes, newGameRef],
              totalCount: gamesRef.totalCount + 1,
            };
          },
        },
      });
    },
  });
  const [removeGameFromEvent] = useMutation(removeGameFromEventMutation, {
    update(cache, { data: { deleteGameEvent } }) {
      cache.modify({
        id: cache.identify(data.event),
        fields: {
          games(gamesRef, { readField }) {
            const newNodesList = gamesRef.nodes.filter(
              nodeRef => deleteGameEvent.game.id !== readField('id', nodeRef)
            );

            return {
              ...gamesRef,
              totalCount: newNodesList.length,
              nodes: newNodesList,
            };
          },
        },
      });
    },
  });
  const [addHostToEvent] = useMutation(addHostToEventMutation, {
    update(cache, { data: { createEntityEvent } }) {
      refetch();
      // I don't f*cking know why this doesn't work
      // cache.modify({
      //   id: cache.identify(data.event),
      //   fields: {
      //     entities(orgsRef) {
      //       const newOrgRef = cache.writeFragment({
      //         fragment: OrgCard.fragments.org,
      //         data: createEntityEvent.entity,
      //       });

      //       return {
      //         ...orgsRef,
      //         nodes: [...orgsRef.nodes, newOrgRef],
      //         totalCount: orgsRef.totalCount + 1,
      //       };
      //     },
      //   },
      // });
    },
  });
  const [removeHostFromEvent] = useMutation(removeHostFromEventMutation, {
    update(cache, { data: { deleteEntityEvent } }) {
      cache.modify({
        id: cache.identify(data.event),
        fields: {
          entities(orgsRef, { readField }) {
            const newNodesList = orgsRef.nodes.filter(
              nodeRef => deleteEntityEvent.entity.id !== readField('id', nodeRef)
            );

            return {
              ...orgsRef,
              totalCount: newNodesList.length,
              nodes: newNodesList,
            };
          },
        },
      });
    },
  });

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const {
    name,
    about,
    site,
    startsAt,
    endsAt,
    location,
    entities,
    participants,
    games,
    cover,
  } = data.event;

  const isGoing =
    currentPerson &&
    participants.nodes.some(({ id }) => id === currentPerson.id);

  let description = `Event on ${new Date(startsAt).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
  })}`;

  if (location) {
    const l = location;

    description += ` in ${l.street ? l.street + ', ' : ''}${l.city}, ${
      l.region
    }, ${l.countryCode}`;
  }

  return (
    <div>
      <Head>
        <title>{name} - Events</title>

        <meta property="og:title" content={name} />
        <meta property="og:description" content={`${description}.`} />
        <meta property="og:url" content={`https://${host}/event/${id}`} />
        {cover && <meta property="og:image" content={cover.thumbnail_url} />}

        <meta
          name="twitter:card"
          content={cover ? 'summary_large_image' : 'summary'}
        />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content={name} />
        <meta name="twitter:description" content={`${description}.`} />
        {cover && <meta name="twitter:image" content={cover.thumbnail_url} />}
      </Head>

      <Navigation />

      <Grid
        templateColumns={['1fr', '1fr', '3fr 1fr']}
        gap={[5, 5, 10]}
        mt={[5, 2, 5]}
        padding={[0, 5]}
      >
        <Box>
          <Box position="relative">
            <AspectRatioBox ratio={3}>
              <Image
                size="100%"
                objectFit="cover"
                src={cover && cover.url}
                alt="Event cover"
                fallbackSrc={placeholder}
              />
            </AspectRatioBox>

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
            >
              {currentPerson && (
                <Link href="/event/[id]/edit" as={`/event/${id}/edit`}>
                  <Button
                    gridRow={['', '1']}
                    gridColumn={['', '2 / span 1']}
                    mb={[2, '0']}
                    leftIcon="edit"
                    size="sm"
                    variantColor="teal"
                  >
                    Edit
                  </Button>
                </Link>
              )}

              <Text
                gridColumn="1"
                textTransform="uppercase"
                as="time"
                datetime={startsAt}
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

              <Heading gridColumn="1" gridRow={['', !location && '3']}>
                {name}
              </Heading>

              {location && (
                <Text gridColumn="1">
                  {location.street && `${location.street}, `}
                  {location.city}, {location.region}, {location.countryCode}
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
                    provider={(x, y, z, dpr) => {
                      const retina =
                        typeof dpr !== 'undefined'
                          ? dpr >= 2
                          : typeof window !== 'undefined' &&
                            window.devicePixelRatio >= 2;
                      return `https://${'abc'.charAt(
                        Math.floor(Math.random() * 3)
                      )}.tile.openstreetmap.org/${z}/${x}/${y}${
                        retina ? '@2x' : ''
                      }.png`;
                    }}
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
                <AvatarGroup size="xs" max={3} justify="flex-end">
                  {participants.nodes.map(({ id, firstName, avatar }) => (
                    <Avatar
                      key={id}
                      name={firstName}
                      src={avatar && avatar.thumbnail_url}
                    />
                  ))}
                </AvatarGroup>
                <Text>
                  {participants.totalCount}{' '}
                  {new Date(endsAt) < new Date() ? 'went' : 'going'}
                </Text>
              </Box>

              {currentPerson && (
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

          {(currentPerson || games.nodes.length > 0) && (
            <Box m={[2, 0]} mb={[5, 5]}>
              <Heading size="md" mb={2}>
                Games
                <Badge
                  verticalAlign="baseline"
                  fontSize="md"
                  ml={2}
                  variant="subtle"
                  variantColor="teal"
                >
                  {games.nodes.length}
                </Badge>
              </Heading>
              <Stack wrap="wrap" spacing={2} isInline>
                {games.nodes.map((game) => (
                  <Box key={game.id} mb={2} position="relative">
                    <GameCard
                      id={game.id}
                      {...game}
                      onRemove={
                        currentPerson
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
                {currentPerson && (
                  <>
                    <IconButton
                      variantColor="teal"
                      aria-label="Add a game to the event"
                      icon="add"
                      onClick={onOpenLinkGame}
                    />
                    <SearchGameModal
                      isOpen={linkGameIsOpen}
                      onClose={onCloseLinkGame}
                      excludedIds={games.nodes.map(({ id }) => id)}
                      onSelect={(game) =>
                        addGameToEvent({
                          variables: { eventId: id, gameId: game.id },
                          optimisticResponse: {
                            __typename: 'Mutation',
                            createGameEvent: {
                              __typename: 'CreateGameEventMutation',
                              game: { __typename: 'Game', ...game },
                            },
                          },
                        })
                      }
                    />
                  </>
                )}
              </Stack>
            </Box>
          )}

          {(currentPerson || entities.nodes.length > 0) && (
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
                {entities.nodes.map((host) => (
                  <OrgCard
                    key={host.id}
                    {...host}
                    onRemove={
                      currentPerson
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
                {currentPerson && (
                  <>
                    <IconButton
                      alignSelf="center"
                      justifySelf="flex-start"
                      variantColor="teal"
                      aria-label="Add a host to the event"
                      icon="add"
                      onClick={onOpenLinkHost}
                    />
                    <SearchOrgModal
                      isOpen={linkHostIsOpen}
                      onClose={onCloseLinkHost}
                      excludedIds={entities.nodes.map(({ id }) => id)}
                      onSelect={(host) =>
                        addHostToEvent({
                          variables: { eventId: id, hostId: host.id },
                          optimisticResponse: {
                            __typename: 'Mutation',
                            createEntityEvent: {
                              __typename: 'CreateEntityEventMutation',
                              entity: { __typename: 'Entity', ...host },
                            },
                          },
                        })
                      }
                    />
                  </>
                )}
              </Grid>
            </Box>
          )}
        </Box>

        <Box m={[2, 0]}>
          <Heading>Related events</Heading>

          <RelatedEvents
            eventId={id}
            tokens={name.split(' ').filter((s) => s.length > 3)}
          />
        </Box>
      </Grid>
    </div>
  );
};

Event.getInitialProps = async (context) => {
  const { id } = context.query;

  if (context.req) {
    return {
      id,
      host: context.req.headers.host,
    };
  }

  return {
    id,
    host: window.location.hostname,
  };
};

export default withApollo({ ssr: true })(Event);
