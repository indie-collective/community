import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';
import {
  chakra,
  Badge,
  Box,
  Flex,
  Heading,
  Stack,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { Map, Overlay, ZoomControl } from 'pigeon-maps';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { db } from '../utils/db.server';
import computeOrg from '../models/org';
// import Error from '../../../client/pages/_error';
import OrgCard from '../components/OrgCard';

const TYPES_COLORS = {
  studio: 'yellow',
  association: 'green',
};

const OrgMarker = React.memo(({ id, logo, name, type, highlighted }) => (
  <Tooltip label={name} aria-label="A tooltip">
    <Box
      width={50}
      height={50}
      position="relative"
      cursor="pointer"
      transformOrigin="bottom center"
      transform={highlighted && 'scale(1.2)'}
      zIndex={highlighted ? 2 : logo ? 1 : 0}
      _hover={{
        zIndex: 2,
        transform: 'scale(1.2)',
      }}
      onClick={() => {
        window.location.hash = id;
      }}
    >
      <chakra.svg
        xmlns="http://www.w3.org/2000/svg"
        width="48px"
        height="48px"
        viewBox="0 0 480 480"
        color={TYPES_COLORS[type] + '.500'}
      >
        <defs>
          <mask id="mask">
            <rect x="0" y="0" width="480" height="480" fill="white" />
            <circle cx="240" cy="200" r="120" fill="black" />
          </mask>
        </defs>

        <path
          d="M175 429 c-63 -60 -108 -126 -126 -187 -38 -129 104 -269 235 -232 85 24 155 108 156 188 0 55 -48 141 -120 215 -36 37 -71 67 -78 67 -7 0 -38 -23 -67 -51z"
          fill="currentColor"
          mask="url(#mask)"
        />
        {logo && (
          <foreignObject x="80" y="40" width="320" height="320">
            <chakra.img
              src={logo.thumbnail_url}
              loading="lazy"
              backgroundColor="currentColor"
              objectFit="cover"
              borderRadius="50%"
              width="320px"
              height="320px"
            />
          </foreignObject>
        )}
      </chakra.svg>
    </Box>
  </Tooltip>
));

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

const MovingBand = React.memo(({ containerRef, header, children }) => {
  const [bandTop, setBandTop] = useState(RETRACTED_BAND_TOP);
  const bandTopRef = useRef(RETRACTED_BAND_TOP);
  const isDraggingBand = useRef(false);
  const listBgColor = useColorModeValue('white', 'gray.800');
  const dragHandlebgColor = useColorModeValue('gray.300', 'gray.500');

  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  const isMobile = variant === 'mobile';

  const onMoveBand = useCallback(
    (e) => {
      console.log('move', isDraggingBand.current);
      if (isDraggingBand.current) {
        const { top } = containerRef.current.getBoundingClientRect();
        const points = e.touches || [];

        const y = (points[0] ? points[0].pageY : e.pageY) - top;
        const newPosition = (y > 0 ? y : 0) + 'px';

        setBandTop(newPosition);
        bandTopRef.current = newPosition;
      }
    },
    [isDraggingBand, containerRef]
  );

  const onMoveBandStop = useCallback(() => {
    console.log('stop', isDraggingBand.current);
    if (isDraggingBand.current) {
      const { top, height } = containerRef.current.getBoundingClientRect();

      if (parseInt(bandTopRef.current) > top + height / 2) {
        setBandTop(RETRACTED_BAND_TOP);
        bandTopRef.current = RETRACTED_BAND_TOP;
      } else {
        setBandTop(0 + 'px');
        bandTopRef.current = 0 + 'px';
      }
      isDraggingBand.current = false;
    }
  }, [isDraggingBand, containerRef]);

  useEffect(() => {
    const tm = document.addEventListener('touchmove', onMoveBand);
    const te = document.addEventListener('touchend', onMoveBandStop);
    const tc = document.addEventListener('touchcancel', onMoveBandStop);
    const mm = document.addEventListener('mousemove', onMoveBand);
    const mu = document.addEventListener('mouseup', onMoveBandStop);

    return () => {
      document.removeEventListener('touchmove', tm);
      document.removeEventListener('touchend', te);
      document.removeEventListener('touchcancel', tc);
      document.removeEventListener('mousemove', mm);
      document.removeEventListener('mouseup', mu);
    };
  }, []);

  return (
    <Flex
      direction="column"
      w={{ base: '100%', md: '400px' }}
      h={{ base: `100%`, md: 'auto' }}
      transform={{
        base: `translate3d(0, ${RETRACTED_BAND_TOP}, 0)`,
        md: 'initial',
      }}
      overflow={{ base: 'hidden', md: 'auto' }}
      sx={{ scrollBehavior: 'smooth' }}
      background={{
        base: listBgColor,
        md: 'transparent',
      }}
      borderTopRadius={24}
      position="relative"
      zIndex="100"
      style={
        isMobile
          ? {
              transform: `translate3d(0, calc(${bandTop} - 100%), 0)`,
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
        onTouchStart={() => {
          isDraggingBand.current = true;
        }}
        onMouseDown={() => {
          isDraggingBand.current = true;
        }}
        p={3}
        userSelect={{ base: 'none', md: 'initial' }}
      >
        {header}
      </Box>
      {children}
    </Flex>
  );
});

export const loader = async ({ request }) => {
  const orgs = await db.entity
    .findMany({
      where: {
        location: {
          isNot: null,
        },
      },
      include: {
        location: true,
        logo: true,
      },
    })
    .then((orgs) => orgs.map(computeOrg));

  const data = {
    orgs: await Promise.all(orgs),
  };
  return json(data);
};

export const meta = () => ({
  title: 'Places',
  description:
    'Video game related companies and organizations all over the world.',
  'og:title': 'Places',
  'og:description':
    'Video game related companies and organizations all over the world.',
  'twitter:card': 'summary_large_image',
  'twitter:site': '@IndieColle',
  'twitter:title': 'Places',
  'twitter:description':
    'Video game related companies and organizations all over the world.',
});

const Places = () => {
  const containerRef = useRef();
  const [currentBounds, setCurrentBounds] = useState();
  const [highlightedOrg, setHighlightedOrg] = useState();

  const {orgs} = useLoaderData();

  useEffect(() => {
    if (!window) return;

    // hack, prevent Chrome's pull-to-refresh on mobile
    // it doesn't work just on this page's container
    document.body.style.overscrollBehaviorY = 'contain';

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, [typeof window]);

  const handleOrgCardEnter = useCallback((org) => setHighlightedOrg(org.id));
  const handleOrgCardOut = useCallback(() => setHighlightedOrg());

  // TODO: see if we can prevent this from changing
  const orgsInBounds = useMemo(
    () =>
      orgs.filter((org) => {
        if (!currentBounds || !org.location || !org.location.latitude)
          return true;

        return inBounds(org.location, currentBounds);
      }),
    [orgs, currentBounds]
  );

  const orgsListHeader = useMemo(
    () => (
      <Heading size="md" textAlign="center" m={2}>
        Locations
        <Badge colorScheme="teal" variant="solid" ml={2} fontSize="xl">
          {orgsInBounds.length}
        </Badge>
      </Heading>
    ),
    [orgsInBounds.length]
  );

  const orgsMarkers = useMemo(() => {
    return orgs.map((org) => (
      // todo: bring back z index 2
      <Overlay
        key={org.id}
        anchor={[org.location.latitude, org.location.longitude]}
        offset={[48 / 2, 48]}
      >
        <OrgMarker {...org} highlighted={org.id === highlightedOrg} />
      </Overlay>
    ));
  }, [orgs]);

  return (
    // TODO: Fix this weird hack, see margin bottom in app
    <Flex
      h={{
        base: 'calc(var(--vh, 1vh) * 100 - 10px)',
        md: 'calc(100vh - 3rem)',
      }}
      direction="column"
    >
      <Box
        ref={containerRef}
        flex="1"
        mt={5}
        padding={{ base: 0, md: 5 }}
        display={{ base: '', md: 'flex' }}
        h="100%"
        overflow="hidden"
      >
        <Map
          defaultWidth={1240}
          defaultHeight={835}
          center={[0, 0]}
          zoom={2}
          onBoundsChanged={({ bounds }) => setCurrentBounds(bounds)}
        >
          <ZoomControl />
        {orgsMarkers}

        {/* TODO: see if we can prevent change in children (see orgsInBounds) */}
        <MovingBand containerRef={containerRef} header={orgsListHeader}>
          <Box
            flex={1}
            overflow="auto"
            px={3}
            sx={{ scrollBehavior: 'smooth' }}
          >
            <OrgList
              orgs={orgsInBounds}
              onMouseEnter={handleOrgCardEnter}
              onMouseOut={handleOrgCardOut}
            />
          </Box>
        </MovingBand>
      </Box>
    </Flex>
  );
};

export default Places;
