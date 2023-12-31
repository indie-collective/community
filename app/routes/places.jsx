import { json } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import React, { useTransition } from 'react';
import {
  chakra,
  Badge,
  Box,
  Flex,
  Heading,
  Tooltip,
  useBreakpointValue,
  keyframes,
  usePrevious,
} from '@chakra-ui/react';
import { Overlay, ZoomControl } from 'pigeon-maps';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import { db } from '../utils/db.server';
import computeOrg from '../models/org';
// import Error from '../../../client/pages/_error';
import ClusterMap from '../components/ClusterMap';
import OrgCard from '../components/OrgCard';
import SwipeableEdgeDrawer from '../components/SwipeableEdgeDrawer';

const TYPES_COLORS = {
  studio: 'yellow',
  association: 'green',
};

const OrgMarker = React.memo(
  ({ id, logo, name, type, highlighted, onClick }) => (
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
        onClick={onClick}
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
  )
);

const highlight = keyframes({
  '0%': {
    transform: 'scale(1)',
  },

  '50%': {
    transform: 'scale(0.9)',
    boxShadow:
      '0 0 0 1px rgba(16, 22, 26, 0.1), 0 4px 8px rgba(16, 22, 26, 0.2), 0 18px 46px 6px rgba(16, 22, 26, 0.2)',
  },

  '100%': {
    transform: 'scale(1)',
  },
});

const Row = ({ index, data, style }) => (
  <div key={data.orgs[index].id} style={style}>
    <OrgCard
      id={data.orgs[index].id}
      sx={{
        '&:target': {
          animation: `${highlight} 500ms ease-in-out 500ms`,
        },
      }}
      {...data.orgs[index]}
      onMouseEnter={() => data.onMouseEnter(data.orgs[index])}
      onMouseOut={() => data.onMouseOut(data.orgs[index])}
      animation={
        data.selectedId === data.orgs[index].id &&
        `${highlight} 500ms ease-in-out 500ms`
      }
    />
  </div>
);

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

const MovingBand = React.memo(({ header, children, isOpen, onClose }) => {
  const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <SwipeableEdgeDrawer header={header} isOpen={isOpen} onClose={onClose}>
        <Box flex="1 1 auto" px={3}>
          {children}
        </Box>
      </SwipeableEdgeDrawer>
    );
  }

  return (
    <Flex
      direction="column"
      w="400px"
      h="auto"
      overflow="auto"
      sx={{ scrollBehavior: 'smooth' }}
      background="transparent"
      borderTopRadius={24}
      position="relative"
      zIndex="100"
    >
      <Box as="header" p={3} userSelect="initial">
        {header}
      </Box>
      <Box flex="1 1 auto" px={3}>
        {children}
      </Box>
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
  viewport:
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
});

const Places = () => {
  const containerRef = useRef();
  const listRef = useRef();
  const [isPending, startTransition] = useTransition();
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(2);
  const [currentBounds, setCurrentBounds] = useState();
  const [highlightedOrg, setHighlightedOrg] = useState();
  const [isMovingBandOpen, setMovingBandOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedId = location.hash?.substring(1);
  const prevSelectedId = usePrevious(selectedId);

  const { orgs } = useLoaderData();

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

  const orgsInBounds = orgs.filter((org) => {
    if (!currentBounds || !org.location || !org.location.latitude) return true;

    return inBounds(org.location, currentBounds);
  });

  useEffect(() => {
    if (!selectedId) return;
    if (prevSelectedId === selectedId) return;

    const cardIndex = orgsInBounds.findIndex((org) => org.id === selectedId);

    if (cardIndex < 0) return;

    startTransition(() => {
      setMovingBandOpen(true);

      listRef.current?.scrollToItem(cardIndex, 'start');
    });
  }, [orgsInBounds, selectedId, prevSelectedId, setMovingBandOpen]);

  const orgsMarkers = useMemo(() => {
    return orgs.map((org) => (
      // todo: bring back z index 2
      <Overlay
        key={org.id}
        anchor={[org.location.latitude, org.location.longitude]}
        offset={[48 / 2, 48]}
      >
        <OrgMarker
          {...org}
          highlighted={org.id === highlightedOrg}
          onClick={(e) => {
            e.preventDefault();
            navigate(`#${org.id}`, { replace: true });
            return false;
          }}
        />
      </Overlay>
    ));
  }, [orgs, highlightedOrg]);

  return (
    // TODO: Fix this weird hack, see margin bottom in app
    <Flex
      h={{
        base: 'calc(var(--vh, 1vh) * 100 - 10px)',
        md: 'calc(100vh - 3rem)',
      }}
      direction="column"
      overflow="hidden"
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
        <ClusterMap
          defaultWidth={1240}
          defaultHeight={835}
          center={center}
          zoom={zoom}
          bounds={currentBounds}
          onBoundsChanged={({ bounds, center, zoom }) => {
            startTransition(() => {
              setCurrentBounds(bounds);
              setCenter(center);
              setZoom(zoom);
            });
          }}
          maxZoom={18}
          zoomSnap={false}
        >
          <ZoomControl />
          {orgsMarkers}
        </ClusterMap>

        <MovingBand
          containerRef={containerRef}
          header={
            <Heading size="md" textAlign="center" m={2} mt={6}>
              Locations
              <Badge colorScheme="teal" variant="solid" ml={2} fontSize="xl">
                {orgsInBounds.length}
              </Badge>
            </Heading>
          }
          isOpen={isMovingBandOpen}
          onClose={() => setMovingBandOpen(false)}
        >
          <AutoSizer defaultHeight={600} defaultWidth={300}>
            {({ height, width }) => (
              <List
                ref={listRef}
                width={width}
                height={height}
                itemCount={orgsInBounds.length}
                itemData={{
                  selectedId,
                  orgs: orgsInBounds,
                  onMouseEnter: handleOrgCardEnter,
                  onMouseOut: handleOrgCardOut,
                }}
                itemSize={90}
                style={{
                  scrollBehavior: 'smooth',
                }}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </MovingBand>
      </Box>
    </Flex>
  );
};

export default Places;
