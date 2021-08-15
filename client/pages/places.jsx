import React from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  chakra,
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Stack,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import Head from 'next/head';
import { Map, Overlay as BaseOverlay, ZoomControl } from 'pigeon-maps';

import Error from './_error';
import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import OrgCard from '../components/OrgCard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const Overlay = chakra(BaseOverlay);

const TYPES_COLORS = {
  STUDIO: 'yellow',
  ASSOCIATION: 'green',
};

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

const highlight = keyframes({
  '0%': {
    transform: 'scale(1)',
  },

  '50%': {
    transform: 'scale(1.1)',
    boxShadow:
      '0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2), 0 18px 46px 6px rgba(16, 22, 26, 0.2)',
  },

  '100%': {
    transform: 'scale(1)',
  },
});

const OrgList = React.memo(({ orgs, onMouseEnter, onMouseOut }) => (
  <Stack spacing={3}>
    {orgs.map((org) => (
      <OrgCard
        key={org.id}
        id={org.id}
        sx={{
          '&:target': {
            animation: `${highlight} 500ms ease-in-out 500ms`,
          },
        }}
        {...org}
        onMouseEnter={() => onMouseEnter(org)}
        onMouseOut={() => onMouseOut(org)}
      />
    ))}
  </Stack>
));

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
  const [highlightedOrg, setHighlightedOrg] = useState();
  const [bandTop, setBandTop] = useState(RETRACTED_BAND_TOP);
  const [isDraggingBand, setIsDraggingBand] = useState(false);
  const { loading, error, data } = useQuery(getCitiesQuery, {
    variables: {},
  });
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  const isMobile = variant === 'mobile';
  const listBgColor = useColorModeValue('white', 'gray.800');
  const dragHandlebgColor = useColorModeValue('gray.300', 'gray.500');

  useEffect(() => {
    if (!window) return;

    // hack, prevent Chrome's pull-to-refresh on mobile
    // it doesn't work just on this page's container
    document.body.style.overscrollBehaviorY = 'contain';

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, [typeof window]);

  const cities = data ? data.cities : { nodes: [] };

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

  const handleOrgCardEnter = useCallback((org) => setHighlightedOrg(org.id));
  const handleOrgCardOut = useCallback(() => setHighlightedOrg());

  const orgsInBounds = useMemo(
    () =>
      cities.nodes
        .map((city) => city.orgs.nodes)
        .flat()
        .filter((org) => {
          if (!currentBounds || !org.location || !org.location.latitude)
            return true;

          return inBounds(org.location, currentBounds);
        }),
    [cities.nodes, currentBounds]
  );

  if (error || (!loading && data.cities === null)) {
    return <Error statusCode={404} />;
  }

  if (loading) {
    return <Spinner />;
  }

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
              <Overlay
                key={org.id}
                anchor={[org.location.latitude, org.location.longitude]}
                offset={[48 / 2, 48]}
                cursor="pointer"
                transformOrigin="bottom center"
                transform={highlightedOrg === org.id && 'scale(1.2)'}
                zIndex={highlightedOrg === org.id ? 2 : org.logo ? 1 : 0}
                _hover={{
                  zIndex: 2,
                  transform: 'scale(1.2)',
                }}
              >
                <Tooltip label={org.name} aria-label="A tooltip">
                  <Box
                    width={50}
                    height={50}
                    position="relative"
                    onClick={() => {
                      window.location.hash = org.id;
                    }}
                  >
                    <chakra.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48px"
                      height="48px"
                      viewBox="0 0 480 480"
                      color={TYPES_COLORS[org.type] + '.500'}
                    >
                      <defs>
                        <mask id="mask">
                          <rect
                            x="0"
                            y="0"
                            width="480"
                            height="480"
                            fill="white"
                          />
                          <circle cx="240" cy="200" r="120" fill="black" />
                        </mask>
                      </defs>

                      <path
                        d="M175 429 c-63 -60 -108 -126 -126 -187 -38 -129 104 -269 235 -232 85 24 155 108 156 188 0 55 -48 141 -120 215 -36 37 -71 67 -78 67 -7 0 -38 -23 -67 -51z"
                        fill="currentColor"
                        mask="url(#mask)"
                      />
                      {org.logo && (
                        <foreignObject x="80" y="40" width="320" height="320">
                          <img
                            style={{
                              backgroundColor: 'currentColor',
                              objectFit: 'cover',
                              borderRadius: '50%',
                              width: '320px',
                              height: '320px',
                            }}
                            src={org.logo.thumbnail_url}
                          />
                        </foreignObject>
                      )}
                    </chakra.svg>
                  </Box>
                </Tooltip>
              </Overlay>
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
          sx={{ 'scroll-behavior': 'smooth' }}
          background={{
            base: listBgColor,
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
                    backgroundColor: dragHandlebgColor,
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
          <Box
            flex={1}
            overflow="auto"
            px={3}
            sx={{ 'scroll-behavior': 'smooth' }}
          >
            <OrgList
              orgs={orgsInBounds}
              onMouseEnter={handleOrgCardEnter}
              onMouseOut={handleOrgCardOut}
            />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default withApollo({ ssr: true })(Cities);
