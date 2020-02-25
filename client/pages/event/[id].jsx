import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import {
  AspectRatioBox,
  Image,
  Box,
  Grid,
  Heading,
  Text,
  Spinner,
  Stack,
  AvatarGroup,
  Avatar,
  Button,
} from '@chakra-ui/core';
import Map from 'pigeon-maps';
import Error from 'next/error';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import OrgCard from '../../components/OrgCard';
import EventCard from '../../components/EventCard';
import Markdown from '../../components/Markdown';

const eventQuery = gql`
  query event($id: UUID!) {
    event(id: $id) {
      id
      name
      cover {
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

      entities {
        totalCount
        nodes {
          id
          name
        }
      }

      games {
        totalCount
        nodes {
          id
          name
          images {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Event = ({ id }) => {
  const validId = uuidRegex.test(id);

  const [isGoing, setIsGoing] = useState(false);
  const { loading, error, data } = useQuery(eventQuery, {
    variables: { id },
    skip: !validId,
  });
  const relatedEvents = [];

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
    games,
    cover,
  } = data.event;

  return (
    <div>
      <Head>
        <title>{name} - Events</title>
      </Head>

      <Navigation />

      <Grid templateColumns="3fr 1fr" gap={10} mt={10} padding={5}>
        <Box flex={2}>
          <Box position="relative">
            <AspectRatioBox ratio={3}>
              <Image
                size="100%"
                objectFit="cover"
                src={cover && cover.url}
                alt="Event cover"
                fallbackSrc="https://via.placeholder.com/800x300?text=Event cover"
              />
            </AspectRatioBox>

            <Box
              width="80px"
              position="absolute"
              right={2}
              bottom={3}
              textAlign="center"
              borderRadius={10}
              background="#ffffffaa"
            >
              <Box
                fontWeight="bold"
                borderRadius="10px 10px 0 0"
                background="#ff0000aa"
                color="white"
              >
                {new Date(startsAt).toLocaleString(undefined, {
                  month: 'short',
                })}
              </Box>
              <Text
                fontWeight="bold"
                fontSize="2.5rem"
                height="60px"
                lineHeight={1.4}
              >
                {new Date(startsAt).toLocaleString(undefined, {
                  day: 'numeric',
                })}
              </Text>
            </Box>
          </Box>

          <Box
            mb={5}
            borderWidth="1px"
            roundedBottom={5}
            minHeight={!location && '100px'}
          >
            <Grid gridTemplateColumns="1fr 200px" padding={2}>
              <Text
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
              <Heading gridRow={!location && '3'}>{name}</Heading>
              {location && (
                <Text>
                  {location.street && `${location.street}, `}
                  {location.city}, {location.region}, {location.countryCode}
                </Text>
              )}

              <Stack
                gridColumn="2 / 3"
                gridRow="1 / 3"
                justifySelf="end"
                isInline
                spacing={2}
                shouldWrapChildren
              >
                {
                  <Link href="/event/[id]/edit" as={`/event/${id}/edit`}>
                    <Button leftIcon="edit" size="sm" variantColor="teal">
                      Edit
                    </Button>
                  </Link>
                }

                <Button
                  variant={isGoing ? 'solid' : 'outline'}
                  variantColor="teal"
                  leftIcon={isGoing ? 'check' : null}
                  onClick={() => setIsGoing(!isGoing)}
                  size="sm"
                  minWidth={100}
                >
                  {isGoing ? 'Going!' : 'Interested?'}
                </Button>
              </Stack>

              <Box
                textAlign="right"
                gridColumn="2 / 3"
                gridRow="2 / 4"
                alignSelf="end"
              >
                <AvatarGroup size="xs" max={3} justify="end">
                  <Avatar
                    name="Ryan Florence"
                    src="https://bit.ly/ryan-florence"
                  />
                  <Avatar
                    name="Segun Adebayo"
                    src="https://bit.ly/sage-adebayo"
                  />
                  <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
                  <Avatar
                    name="Prosper Otemuyiwa"
                    src="https://bit.ly/prosper-baba"
                  />
                  <Avatar
                    name="Christian Nwamba"
                    src="https://bit.ly/code-beast"
                  />
                </AvatarGroup>
                <Text>10 people going</Text>
              </Box>
            </Grid>

            {location && location.longitude && location.latitude && (
              <Box
                width="100%"
                height="150px"
                overflow="hidden"
                borderRadius="0 0 5px 5px"
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
          </Box>

          {about && (
            <Box mb={5} borderWidth="1px" borderRadius={5} padding={2}>
              <Heading as="h3" fontSize="2xl">
                Description
              </Heading>
              <Markdown value={about} />
            </Box>
          )}

          {games.nodes.length > 0 && (
            <Box mb={5}>
              <Heading size="md" mb={2}>
                Games
              </Heading>
              <Box overflowX="auto">
                {games.nodes.map(({ id, name, images }) => (
                  <Box key={id} display="inline-block" mr={4}>
                    <GameCard
                      key={id}
                      id={id}
                      name={name}
                      images={images.nodes}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {entities.nodes.length > 0 && (
            <Box>
              <Heading size="md" mb={2}>
                Hosts
              </Heading>
              <Box
                display="grid"
                gridTemplateColumns="33% 33% 33%"
                gridColumnGap={3}
                gridRowGap={3}
              >
                {entities.nodes.map(({ id, name, images }) => (
                  <OrgCard key={id} id={id} name={name} images={images.nodes} />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <Heading>Related events</Heading>
          <Stack mt={5} spacing={5} shouldWrapChildren>
            {relatedEvents.length > 0 ? (
              relatedEvents.map(event => <EventCard {...event} />)
            ) : (
              <Text>No related events.</Text>
            )}
          </Stack>
        </Box>
      </Grid>
    </div>
  );
};

Event.getInitialProps = async context => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ ssr: true })(Event);
