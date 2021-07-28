import { gql, useQuery } from '@apollo/client';
import { Box, Flex, Spinner, Tooltip } from '@chakra-ui/react';
// import { TriangleUpIcon } from '@chakra-ui/icons';
import Head from 'next/head';
import { Map, Marker, Overlay, ZoomControl } from 'pigeon-maps';

import Error from './_error';
import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';

const getCitiesQuery = gql`
  query getCities {
    cities {
      nodes {
        name
        region
        countryCode
        orgs {
          nodes {
            name
            type
            logo {
              thumbnail_url
            }
            # url
            location {
              street
              latitude
              longitude
            }
          }
        }
      }
    }
  }
`;

const Cities = () => {
  const { loading, error, data } = useQuery(getCitiesQuery, {
    variables: {},
  });

  if (error || (!loading && data.cities === null)) {
    return <Error statusCode={404} />;
  }

  if (loading) {
    return <Spinner />;
  }

  const { cities } = data;

  return (
    <Flex h="calc(100vh - 8px)" direction="column">
      <Head>
        <title>Places</title>
      </Head>

      <Navigation />

      <Box flex="1" mt={5} padding={{ base: 0, md: 5 }}>
        <Map defaultWidth={1240} defaultHeight={835} center={[0, 0]} zoom={2}>
          <ZoomControl />
          {cities.nodes
            .map((city) => city.orgs.nodes)
            .filter(
              (org) =>
                !org.location ||
                !org.location.longitude ||
                !org.location.latitude
            )
            .flat()
            .map((org) => (
              // <Overlay anchor={[location.latitude, location.longitude]}>
              //   <Tooltip label="Hey, I'm here!" aria-label="A tooltip">
              //     <TriangleUpIcon />
              //   </Tooltip>
              // </Overlay>
              <Marker
                anchor={[org.location.latitude, org.location.longitude]}
                color={org.type === 'STUDIO' ? 'red' : 'green'}
              />
            ))}
        </Map>
      </Box>
    </Flex>
  );
};

export default withApollo({ ssr: true })(Cities);
