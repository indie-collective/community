import { useLoaderData, useLocation, useNavigate } from 'react-router';
import React, { useTransition, useCallback, useEffect, useMemo, useRef, useState  } from 'react';
import {
  Box,
  Flex,
  useBreakpointValue,
  Switch,
  Checkbox,
  CheckboxGroup,
  HStack,
} from '@chakra-ui/react';
import { Overlay, ZoomControl } from 'pigeon-maps';
import { usePrevious } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

// import Error from '../../../client/pages/_error';
import { Tooltip } from '../components/ui/tooltip';
import ClusterMap from '../components/ClusterMap';
import { focusOn, placeAt, zoomToFit } from '../utils/mapFocus';
import OrgCard from '../components/OrgCard';
import SwipeableEdgeDrawer from '../components/SwipeableEdgeDrawer';
import SectionHeading from '../components/SectionHeading';
import MapPin from '../components/MapPin';
import { pinColor } from '../utils/orgTypes';
import { pageMeta } from '../utils/meta';
import { listMappedOrganizations } from '../data/organizations.server';
import { listMappedUpcomingEvents } from '../data/events.server';
import EventMapCard from '../components/EventMapCard';

const OrgMarker = React.memo(
  ({ id, logo, name, type, highlighted, onClick }) => (
    <Tooltip content={name} aria-label="A tooltip">
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
        <MapPin color={pinColor(type)} logo={logo} />
      </Box>
    </Tooltip>
  )
);

// What the map shows (#211), each with a label and pin colour.
const KINDS = [
  ['studio', 'Studios'],
  ['association', 'Associations'],
  ['event', 'Upcoming events'],
];

const Row = ({ index, data, style }) => (
  <div key={data.orgs[index].id} style={style}>
    {data.orgs[index].type === 'event' ? (
      <EventMapCard
        css={{ '&:target': { animation: 'highlight' } }}
        {...data.orgs[index]}
        onMouseEnter={() => data.onMouseEnter(data.orgs[index])}
        onMouseOut={() => data.onMouseOut(data.orgs[index])}
        animation={data.selectedId === data.orgs[index].id ? 'highlight' : undefined}
      />
    ) : (
    <OrgCard
      id={data.orgs[index].id}
      // `highlight` is the animation token (and keyframes) in theme.js.
      css={{
        '&:target': {
          animation: 'highlight',
        },
      }}
      {...data.orgs[index]}
      onMouseEnter={() => data.onMouseEnter(data.orgs[index])}
      onMouseOut={() => data.onMouseOut(data.orgs[index])}
      animation={
        data.selectedId === data.orgs[index].id ? 'highlight' : undefined
      }
    />
    )}
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
      css={{
        scrollBehavior: 'smooth',
      }}
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
  const params = new URL(request.url).searchParams;
  // ?country=XX opens the map on that country's organisations (#258).
  const countryCode = params.get('country')?.toUpperCase();
  // ?at=lat,lng opens it on a place, from an event or organisation page (#322).
  const at = placeAt(params.get('at'));

  const [orgs, events] = await Promise.all([
    listMappedOrganizations(),
    listMappedUpcomingEvents(),
  ]);
  return {
    orgs,
    // Upcoming events go on the map too (#211); past ones don't.
    events: events.map((event) => ({ ...event, type: 'event', logo: event.cover })),
    focus: at
      ? focusOn([at])
      : countryCode
      ? focusOn(
          orgs
            .filter((org) => org.location?.country_code === countryCode)
            .map((org) => org.location)
        )
      : null,
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Places',
    description: 'Video game studios, associations and upcoming events on a map of the world.',
    path: location.pathname,
  });

const Places = () => {
  const containerRef = useRef();
  const listRef = useRef();
  const [isPending, startTransition] = useTransition();
  const { orgs, events, focus } = useLoaderData();
  const [center, setCenter] = useState(focus?.center ?? [0, 0]);
  const [zoom, setZoom] = useState(() =>
    focus ? zoomToFit(focus, { width: 1240, height: 835 }) : 2
  );
  const [currentBounds, setCurrentBounds] = useState();
  const [highlightedOrg, setHighlightedOrg] = useState();
  const [isMovingBandOpen, setMovingBandOpen] = useState(false);
  // #39: closed organisations are hidden unless asked for. #211: studios,
  // associations and upcoming events can each be hidden.
  const [showClosed, setShowClosed] = useState(false);
  const [shownKinds, setShownKinds] = useState(() => KINDS.map(([kind]) => kind));
  const shownOrgs = useMemo(
    () =>
      [...orgs, ...events].filter(
        (item) =>
          shownKinds.includes(item.type) &&
          (showClosed || item.status !== 'closed')
      ),
    [orgs, events, shownKinds, showClosed]
  );
  const location = useLocation();
  const navigate = useNavigate();
  const selectedId = location.hash?.substring(1);
  const prevSelectedId = usePrevious(selectedId);

  // Fit the country to the map's real size once it's on screen.
  useEffect(() => {
    const box = containerRef.current?.getBoundingClientRect();
    if (focus && box?.width) setZoom(zoomToFit(focus, box));
  }, [focus]);

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

  const orgsInBounds = shownOrgs.filter((org) => {
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
    return shownOrgs.map((org) => (
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
  }, [shownOrgs, highlightedOrg]);

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
      <Flex justify="space-between" align="center" wrap="wrap" gap={3} px={5} mt={3}>
        <CheckboxGroup
          value={shownKinds}
          onValueChange={setShownKinds}
          aria-label="Show on the map"
        >
          <HStack gap={4} wrap="wrap">
            {KINDS.map(([kind, label]) => (
              <Checkbox.Root key={kind} value={kind} size="sm">
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{label}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </HStack>
        </CheckboxGroup>
        <Switch.Root
          size="sm"
          checked={showClosed}
          onCheckedChange={({ checked }) => setShowClosed(checked)}
        >
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label>Show closed organisations</Switch.Label>
        </Switch.Root>
      </Flex>
      <Box
        ref={containerRef}
        flex="1"
        mt={2}
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
            <SectionHeading
              justify="center"
              m={2}
              mt={6}
              count={orgsInBounds.length}
              countLabel="locations"
              badgeProps={{ variant: 'solid', fontSize: 'xl' }}
            >
              Locations
            </SectionHeading>
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
