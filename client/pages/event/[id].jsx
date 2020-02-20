import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AspectRatioBox, Image, Box, Grid, Heading, Text, Spinner, Stack } from '@chakra-ui/core';
import Map from 'pigeon-maps'
import Error from 'next/error';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import OrgCard from '../../components/OrgCard';
import EventCard from '../../components/EventCard';

const eventQuery = gql`
  query event($id: UUID!) {
    event(id: $id) {
      id
      name
      about
      site
      startsAt
      endsAt

      location {
        id
        country
        city
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

const Event = ({id}) => {
  const validId = uuidRegex.test(id);

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

      <Grid templateColumns="2fr 1fr" gap={6} mt={10}>
        <Box flex={2}>

          <AspectRatioBox ratio={3}>
            <Image
              size="100%"
              objectFit="cover"
              src={cover}
              alt="Event cover"
              fallbackSrc="https://via.placeholder.com/800x300?text=Event cover"
            />
          </AspectRatioBox>

          <Box mb={5} border="1px solid #eee" borderRadius="0 0 5px 5px">
            <Grid gridTemplateColumns="5rem 1fr" mb={2} padding={2}>
              <Heading gridColumn="2 / 3" textAlign="right">{name}</Heading>
              <Text textAlign="center" fontWeight="bold" gridColumn="1 / 2" gridRow="1 / 3" as="time" datetime={startsAt}>
                <Box as="span" fontSize="3xl" display="block">3</Box>
                <Box as="span">mai 2019</Box>
              </Text>
              <Text gridColumn="2 / 3" textAlign="right">11 rue du Manoir de Sévigné, Rennes, France</Text>
            </Grid>

            {location.longitude && location.latitude && (
              <Box width="100%" height="150px" overflow="hidden" borderRadius="0 0 5px 5px">
                <Map
                  defaultWidth="1200px"
                  defaultHeight="150px"
                  center={[location.latitude, location.longitude]}
                  zoom={16}
                  mouseEvents={false}
                  touchEvents={false}
                >
                </Map>
              </Box>
            )}
          </Box>

          {about && (
            <Box mb={5} border="1px solid #eee" borderRadius={5} padding={2}>
              <Heading as="h3" fontSize="2xl">Description</Heading>
              <Text>
                {about}
              </Text>
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
                    <GameCard key={id} id={id} name={name} images={images.nodes} />
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
          <Stack>
            {relatedEvents.length > 0 ? relatedEvents.map(event => <EventCard {...event} />) : <Text>No related events.</Text>}
          </Stack>
        </Box>
      </Grid>
    </div>
  );
};

Event.getInitialProps = async (context) => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ssr: true})(Event);
