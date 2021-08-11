import { gql, useQuery } from '@apollo/client';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Stack,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import Head from 'next/head';
import { Map, Marker, Overlay, ZoomControl } from 'pigeon-maps';

import Error from './_error';
import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import OrgCard from '../components/OrgCard';
import { useCallback, useEffect, useRef, useState } from 'react';

const getCitiesQuery = gql`
  ${OrgCard.fragments.org}

  query getCities {
    cities {
      nodes {
        name
        region
        countryCode
        orgs {
          nodes {
            ...OrgCardOrg
            id
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

function inBounds(point, bounds) {
  var eastBound = point.longitude < bounds.ne[1];
  var westBound = point.longitude > bounds.sw[1];
  var inLong;

  if (bounds.ne[1] < bounds.sw[1]) {
    inLong = eastBound || westBound;
  } else {
    inLong = eastBound && westBound;
  }

  var inLat = point.latitude > bounds.sw[0] && point.latitude < bounds.ne[0];
  return inLat && inLong;
}

const RETRACTED_BAND_TOP = '90%';

const Cities = () => {
  const containerRef = useRef();
  const [currentBounds, setCurrentBounds] = useState();
  const [bandTop, setBandTop] = useState(RETRACTED_BAND_TOP);
  const [isDraggingBand, setIsDraggingBand] = useState(false);
  const { loading, error, data } = useQuery(getCitiesQuery, {
    variables: {},
  });
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  const isMobile = variant === 'mobile';

  useEffect(() => {
    if (!window) return;

    // hack, prevent Chrome's pull-to-refresh on mobile
    // it doesn't work just on this page's container
    document.body.style.overscrollBehaviorY = 'contain';

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, [typeof window])

  if (error || (!loading && data.cities === null)) {
    return <Error statusCode={404} />;
  }

  if (loading) {
    return <Spinner />;
  }

  const { cities } = data;

  cities.nodes
    .map((city) => city.orgs.nodes)
    .flat()
    .filter((org) => {
      if (!currentBounds || !org.location || !org.location.latitude)
        return true;

      return (
        currentBounds.ne[0] > org.location.latitude > currentBounds.sw[0] &&
        currentBounds.ne[1] > org.location.longitude > currentBounds.sw[1]
      );
    });

  const onMoveBand = useCallback((e) => {
    if (isDraggingBand) {
      const { top } = containerRef.current.getBoundingClientRect();
      const points = e.changedTouches || [];

      setBandTop((points[0] ? points[0].pageY : e.pageY) - top + 'px');
    }
  });

  const onMoveBandStop = useCallback(() => {
    if (isDraggingBand) {
      const { top, height } = containerRef.current.getBoundingClientRect();

      if (parseInt(bandTop) > top + height / 2) {
        setBandTop(RETRACTED_BAND_TOP);
      } else {
        setBandTop(0 + 'px');
      }
      setIsDraggingBand(false);
    }
  });

  const orgsInBounds = cities.nodes
    .map((city) => city.orgs.nodes)
    .flat()
    .filter((org) => {
      if (!currentBounds || !org.location || !org.location.latitude)
        return true;

      return inBounds(org.location, currentBounds);
    });

  return (
    // TODO: Fix this weird hack, see margin bottom in app
    <Flex
      h={{
        base: 'calc(var(--vh, 1vh) * 100 - 10px)',
        md: 'calc(100vh - 3rem)',
      }}
      direction="column"
    >
      <Head>
        <title>Places</title>
        <meta
          name="description"
          content="Video game related companies and organizations all over the world."
        />
        <meta property="og:title" content="Places" />
        <meta
          property="og:description"
          content="Video game related companies and organizations all over the world."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content="Places" />
        <meta
          name="twitter:description"
          content="Video game related companies and organizations all over the world."
        />
      </Head>

      <Navigation />

      <Box
        ref={containerRef}
        flex="1"
        mt={5}
        padding={{ base: 0, md: 5 }}
        display={{ base: '', md: 'flex' }}
        h="100%"
        overflow="hidden"
        onTouchMove={isMobile ? onMoveBand : undefined}
        onTouchEnd={isMobile ? onMoveBandStop : undefined}
        onTouchCancel={isMobile ? onMoveBandStop : undefined}
        onMouseMove={isMobile ? onMoveBand : undefined}
        onMouseUp={isMobile ? onMoveBandStop : undefined}
      >
        <Map
          defaultWidth={1240}
          defaultHeight={835}
          center={[0, 0]}
          zoom={2}
          onBoundsChanged={({ bounds }) => setCurrentBounds(bounds)}
        >
          <ZoomControl />
          {cities.nodes
            .map((city) => city.orgs.nodes)
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

        <Flex
          direction="column"
          w={{ base: '100%', md: '400px' }}
          h={{ base: `100%`, md: 'auto' }}
          transform={{
            base: `translateY(${RETRACTED_BAND_TOP})`,
            md: 'initial',
          }}
          overflow={{ base: 'hidden', md: 'auto' }}
          background={{
            base: useColorModeValue('white', 'gray.800'),
            md: 'transparent',
          }}
          borderTopRadius={24}
          style={
            isMobile
              ? {
                  transform: `translateY(calc(${bandTop} - 100%))`,
                }
              : undefined
          }
        >
          <Box
            as="header"
            _before={
              isMobile
                ? {
                    content: '""',
                    display: 'block',
                    margin: 'auto',
                    width: '40px',
                    height: '4px',
                    borderRadius: 4,
                    backgroundColor: useColorModeValue('gray.300', 'gray.500'),
                  }
                : undefined
            }
            onTouchStart={() => setIsDraggingBand(true)}
            onMouseDown={() => setIsDraggingBand(true)}
            p={3}
            userSelect={{ base: 'none', md: 'initial' }}
          >
            <Heading size="md" textAlign="center" m={2}>
              Locations
              <Badge colorScheme="teal" variant="solid" ml={2} fontSize="xl">
                {orgsInBounds.length}
              </Badge>
            </Heading>
          </Box>
          <Box flex={1} overflow="auto" px={3}>
            <Stack spacing={3}>
              {orgsInBounds.map((org) => (
                <OrgCard key={org.id} {...org} />
              ))}
            </Stack>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default withApollo({ ssr: true })(Cities);
