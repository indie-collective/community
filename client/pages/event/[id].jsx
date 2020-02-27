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
import RelatedEvents from '../../components/RelatedEvents';
import usePlaceholder from '../../hooks/usePlaceholder';

const eventQuery = gql`
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

const Event = ({ id, host }) => {
  const validId = uuidRegex.test(id);

  const placeholder = usePlaceholder();
  const [isGoing, setIsGoing] = useState(false);
  const { loading, error, data } = useQuery(eventQuery, {
    variables: { id },
    skip: !validId,
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
    games,
    cover,
  } = data.event;

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

            <Box
              width={["50px", "65px", "80px"]}
              position="absolute"
              right={2}
              bottom={3}
              textAlign="center"
              borderRadius={[5, 8, 10]}
              background="#ffffffaa"
            >
              <Box
                fontSize={["xs", "sm", "md"]}
                fontWeight="bold"
                roundedTop={[5, 8, 10]}
                background="#ff0000aa"
                color="white"
              >
                {new Date(startsAt).toLocaleString(undefined, {
                  month: 'short',
                })}
              </Box>
              <Text
                fontWeight="bold"
                fontSize={["2xl", "3xl", "4xl"]}
                height={["35px", "45px", "60px"]}
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
            borderWidth={['', '1px']}
            roundedBottom={5}
            minHeight={!location && '100px'}
          >
            <Grid
              gridTemplateColumns={['1fr', '1fr auto auto']}
              columnGap={2}
              padding={2}
            >
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
                alignSelf={['', 'end']}
                display={['flex', 'block']}
                flexDirection={['row-reverse', '']}
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

              <Button
                mt={[2, '0']}
                gridRow={['', '1']}
                gridColumn={['', '3']}
                variant={isGoing ? 'solid' : 'outline'}
                variantColor="teal"
                leftIcon={isGoing ? 'check' : null}
                onClick={() => setIsGoing(!isGoing)}
                size="sm"
                minWidth={100}
              >
                {isGoing ? 'Going!' : 'Interested?'}
              </Button>
            </Grid>
          </Box>

          {about && (
            <Box
              m={[2, 0]}
              mb={5}
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

          {games.nodes.length > 0 && (
            <Box m={[2, 0]} mb={5}>
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

        <Box m={[2, 0]}>
          <Heading>Related events</Heading>

          <RelatedEvents eventId={id} tokens={name.split(' ').filter(s => s.length > 3)} />
        </Box>
      </Grid>
    </div>
  );
};

Event.getInitialProps = async context => {
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
