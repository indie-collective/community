import { useLoaderData, useLocation, useNavigate } from 'react-router';
import React, {
  useTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  useBreakpointValue,
  Switch,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import { Overlay, ZoomControl } from 'pigeon-maps';
import { usePrevious } from 'react-use';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import { Tooltip } from '../components/ui/tooltip';
import AtlasMark, { LogoMark } from '../components/AtlasMark';
import ClusterMap from '../components/ClusterMap';
import { focusOn, placeAt, zoomToFit } from '../utils/mapFocus';
import SwipeableEdgeDrawer from '../components/SwipeableEdgeDrawer';
import { SectionTitle } from '../components/Page';
import Link from '../components/Link';
import { pageMeta } from '../utils/meta';
import { eventPath, orgPath } from '../utils/slug';
import { COLUMNS, PLATES, ROWS, gazetteerRows, scaleBar } from '../utils/atlas';
import { countryTable } from '../utils/countryTable';
import countryNames from '../assets/countries.json';
import continents from '../assets/continents.json';
import { listCountryFacts } from '../data/countries.server';
import { listMappedOrganizations } from '../data/organizations.server';
import { listMappedUpcomingEvents } from '../data/events.server';
import { useT } from '../i18n';

const OrgMarker = React.memo(({ name, type, logo, highlighted, onClick }) => (
  <Tooltip content={name} aria-label="A tooltip">
    <Box
      width="28px"
      height="28px"
      display="grid"
      placeItems="center"
      cursor="pointer"
      transform={highlighted ? 'scale(1.5)' : undefined}
      zIndex={highlighted ? 2 : 1}
      position="relative"
      _hover={{ zIndex: 2, transform: 'scale(1.5)' }}
      onClick={onClick}
    >
      {/* Its logo when it has one, else its mark. */}
      {logo?.thumbnail_url ? (
        <LogoMark type={type} logo={logo} size={26} />
      ) : (
        <AtlasMark type={type} size={type === 'event' ? 20 : 17} />
      )}
    </Box>
  </Tooltip>
));

// What the map shows (#211), each with its message and mark.
const KINDS = [
  ['studio', 'nav.studios'],
  ['association', 'nav.associations'],
  ['event', 'atlas.upcomingEvents'],
];

const ROW_HEIGHT = 44;

// A place in the gazetteer: going there moves the map onto it.
const PlaceRow = ({ row, onGo, t }) => (
  <Flex
    as="button"
    type="button"
    cursor="pointer"
    h="100%"
    w="100%"
    px={1}
    align="center"
    justify="space-between"
    gap={2}
    textAlign="left"
    borderBottom="2px solid"
    borderColor="ink"
    _hover={{ bg: 'surface' }}
    onClick={() => onGo(row)}
    title={t('atlas.goTo', {
      place: row.city ?? countryNames[row.code] ?? row.code,
    })}
  >
    <Text as="span" fontFamily="heading" fontWeight="semibold" truncate>
      {row.city ?? countryNames[row.code] ?? row.code}
      {row.city && row.code && (
        <Text
          as="span"
          fontFamily="body"
          fontWeight="medium"
          fontSize="xs"
          color="muted"
          ml={1.5}
        >
          {row.code}
        </Text>
      )}
    </Text>
    <HStack
      as="span"
      gap={2}
      fontSize="xs"
      fontWeight="semibold"
      flexShrink={0}
      fontVariantNumeric="tabular-nums"
    >
      {KINDS.map(([kind]) =>
        row.counts[kind] > 0 ? (
          <HStack as="span" gap={0.5} key={kind}>
            <AtlasMark type={kind} size={11} />
            {row.counts[kind]}
          </HStack>
        ) : null
      )}
      <Text
        as="span"
        minW="22px"
        textAlign="right"
        color="brandDeep"
        fontWeight="bold"
      >
        {row.ref}
      </Text>
    </HStack>
  </Flex>
);

const EntryRow = ({ item, selected, onMouseEnter, onMouseOut, t }) => (
  <Flex
    id={item.id}
    align="center"
    gap={2}
    h="100%"
    pl={2}
    pr={1}
    borderBottom="1px solid"
    borderColor="rule"
    _hover={{ bg: 'surface' }}
    css={{ '&:target': { animation: 'highlight' } }}
    animation={selected ? 'highlight' : undefined}
    onMouseEnter={() => onMouseEnter(item)}
    onMouseOut={() => onMouseOut(item)}
  >
    <LogoMark type={item.type} logo={item.logo} size={24} />
    <Link
      to={item.type === 'event' ? eventPath(item) : orgPath(item)}
      title={item.name}
      style={{ minWidth: 0 }}
    >
      <Text
        as="span"
        display="block"
        fontSize="sm"
        fontWeight="medium"
        truncate
        _hover={{ textDecoration: 'underline' }}
      >
        {item.name}
      </Text>
    </Link>
    {item.status === 'closed' && (
      <Text as="span" fontSize="xs" color="muted" flexShrink={0}>
        {t('atlas.closed')}
      </Text>
    )}
  </Flex>
);

const Row = ({ index, data, style }) => {
  const row = data.rows[index];
  return (
    <div style={style}>
      {row.kind === 'place' ? (
        <PlaceRow row={row} onGo={data.onGo} t={data.t} />
      ) : (
        <EntryRow
          item={row.item}
          selected={data.selectedId === row.item.id}
          onMouseEnter={data.onMouseEnter}
          onMouseOut={data.onMouseOut}
          t={data.t}
        />
      )}
    </div>
  );
};

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

const MovingBand = React.memo(
  ({ header, label, children, isOpen, onClose }) => {
    const variant = useBreakpointValue({ base: 'mobile', md: 'desktop' });
    const isMobile = variant === 'mobile';

    if (isMobile) {
      return (
        <SwipeableEdgeDrawer
          header={header}
          label={label}
          isOpen={isOpen}
          onClose={onClose}
        >
          <Box flex="1 1 auto" px={3}>
            {children}
          </Box>
        </SwipeableEdgeDrawer>
      );
    }

    return (
      <Flex
        direction="column"
        w="340px"
        flexShrink={0}
        h="100%"
        overflow="hidden"
        position="relative"
      >
        <Box as="header" pb={2} userSelect="initial">
          {header}
        </Box>
        <Box flex="1 1 auto" minH={0}>
          {children}
        </Box>
      </Flex>
    );
  }
);

// The letters or numbers along the edge of the plate.
const EdgeRefs = ({ refs, vertical }) => (
  <Flex
    direction={vertical ? 'column' : 'row'}
    fontSize="2xs"
    fontWeight="semibold"
    color="muted"
    aria-hidden
    userSelect="none"
  >
    {refs.map((ref) => (
      <Box key={ref} flex="1" display="grid" placeItems="center">
        {ref}
      </Box>
    ))}
  </Flex>
);

export const loader = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  // ?country=XX opens the map on that country's organisations (#258).
  const countryCode = params.get('country')?.toUpperCase();
  // ?at=lat,lng opens it on a place, from an event or organisation page (#322).
  const at = placeAt(params.get('at'));

  const [orgs, events, { locations, gameLinks, events: countryEvents }] =
    await Promise.all([
      listMappedOrganizations(),
      listMappedUpcomingEvents(),
      listCountryFacts(),
    ]);
  return {
    orgs,
    // Upcoming events go on the map too (#211); past ones don't.
    events: events.map((event) => ({
      ...event,
      type: 'event',
      logo: event.cover,
    })),
    focus: at
      ? focusOn([at])
      : countryCode
        ? focusOn(
            orgs
              .filter((org) => org.location?.country_code === countryCode)
              .map((org) => org.location)
          )
        : null,
    // The atlas's contents: every country with a scene, by name.
    contents: countryTable({
      locations,
      gameLinks,
      events: countryEvents,
      names: countryNames,
      continents,
    })
      .map(({ code, name, studios, associations }) => ({
        code,
        name,
        count: studios + associations,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Atlas',
    description:
      'Video game studios, associations and upcoming events on a map of the world.',
    path: location.pathname,
  });

const WORLD = PLATES[0];
// As wide as the window lets it, past the page's column: a plate wants room.
const PLATE_WIDTH = 'min(1320px, 100vw - 32px)';

const Places = () => {
  const t = useT();
  const sheetRef = useRef();
  const listRef = useRef();
  const [isPending, startTransition] = useTransition();
  const { orgs, events, focus, contents } = useLoaderData();
  const [center, setCenter] = useState(focus?.center ?? WORLD.center);
  const [zoom, setZoom] = useState(() =>
    focus ? zoomToFit(focus, { width: 1240, height: 835 }) : 2
  );
  const [plate, setPlate] = useState(focus ? null : WORLD.key);
  // Where a plate put the map: moving away from there leaves the plate.
  const plateView = useRef(null);
  const [currentBounds, setCurrentBounds] = useState();
  const [highlightedOrg, setHighlightedOrg] = useState();
  const [isMovingBandOpen, setMovingBandOpen] = useState(false);
  // #39: closed organisations are hidden unless asked for. #211: studios,
  // associations and upcoming events can each be hidden.
  const [showClosed, setShowClosed] = useState(false);
  // Folded on a phone, where it would hide the map.
  const [legendOpen, setLegendOpen] = useState(false);
  const [shownKinds, setShownKinds] = useState(() =>
    KINDS.map(([kind]) => kind)
  );
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
    const box = sheetRef.current?.getBoundingClientRect();
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

  const handleOrgCardEnter = useCallback(
    (org) => setHighlightedOrg(org.id),
    []
  );
  const handleOrgCardOut = useCallback(() => setHighlightedOrg(), []);

  const openPlate = (next) => {
    const box = sheetRef.current?.getBoundingClientRect();
    const nextZoom = box?.width ? zoomToFit(next, box, { margin: 0 }) : zoom;
    plateView.current = { center: next.center, zoom: nextZoom };
    setPlate(next.key);
    setCenter(next.center);
    setZoom(nextZoom);
  };

  const goToPlace = useCallback(({ latitude, longitude }) => {
    setCenter([latitude, longitude]);
    setZoom((current) => Math.max(current, 9));
    setMovingBandOpen(false);
  }, []);

  const orgsInBounds = shownOrgs.filter((org) => {
    if (!currentBounds || !org.location || !org.location.latitude) return true;

    return inBounds(org.location, currentBounds);
  });
  const rows = useMemo(
    () => gazetteerRows(orgsInBounds, currentBounds),
    // orgsInBounds is new each render, from these.
    [shownOrgs, currentBounds]
  );

  useEffect(() => {
    if (!selectedId) return;
    if (prevSelectedId === selectedId) return;

    const rowIndex = rows.findIndex(({ item }) => item?.id === selectedId);

    if (rowIndex < 0) return;

    startTransition(() => {
      setMovingBandOpen(true);

      listRef.current?.scrollToItem(rowIndex, 'center');
    });
  }, [rows, selectedId, prevSelectedId, setMovingBandOpen]);

  const orgsMarkers = useMemo(() => {
    return shownOrgs.map((org) => (
      // todo: bring back z index 2
      <Overlay
        key={org.id}
        anchor={[org.location.latitude, org.location.longitude]}
        offset={[14, 14]}
      >
        <OrgMarker
          name={org.name}
          type={org.type}
          logo={org.logo}
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

  const scale = scaleBar(center[0], zoom);
  const plateName = plate ? t(`atlas.plate.${plate}`) : t('atlas.thisView');

  return (
    <Box
      w={{ base: '100%', md: PLATE_WIDTH }}
      ml={{ base: 0, md: `calc((100% - ${PLATE_WIDTH}) / 2)` }}
      px={{ base: 3, md: 0 }}
      pt={{ base: 4, md: 6 }}
    >
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap={3} mb={4}>
        <Box minW={0}>
          <Heading
            as="h1"
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="600"
            letterSpacing="-0.03em"
            lineHeight="1"
          >
            {t('atlas.title')}
          </Heading>
        </Box>
        <HStack as="nav" aria-label={t('atlas.plates')} gap={1.5} wrap="wrap">
          {PLATES.map((option) => (
            <Button
              key={option.key}
              size="sm"
              rounded="full"
              variant="outline"
              aria-pressed={plate === option.key}
              onClick={() => openPlate(option)}
            >
              {t(`atlas.plate.${option.key}`)}
            </Button>
          ))}
        </HStack>
      </Flex>

      <Flex
        gap={6}
        h={{
          base: 'calc(var(--vh, 1vh) * 72)',
          md: 'max(520px, 100vh - 13rem)',
        }}
      >
        {/* The plate, framed like a printed one: a double rule, its squares lettered. */}
        <Grid
          flex="1"
          minW={0}
          templateColumns="20px minmax(0, 1fr) 20px"
          templateRows="20px minmax(0, 1fr) 20px"
          bg="surface"
          borderWidth="3px"
          borderStyle="double"
          borderColor="ink"
        >
          <Box />
          <EdgeRefs refs={COLUMNS} />
          <Box />
          <EdgeRefs refs={ROWS} vertical />
          <Box
            ref={sheetRef}
            position="relative"
            minW={0}
            minH={0}
            display="flex"
            overflow="hidden"
            borderWidth="1px"
            borderColor="ink"
            // Old paper in daylight; the dark map stays as it is.
            css={{
              _light: {
                '& .pigeon-tiles-box img[src^="https://tile.openstreetmap.org/"]':
                  {
                    filter:
                      'sepia(0.35) saturate(0.6) brightness(1.03) contrast(0.92)',
                  },
              },
            }}
          >
            <ClusterMap
              defaultWidth={1240}
              defaultHeight={835}
              center={center}
              zoom={zoom}
              bounds={currentBounds}
              onBoundsChanged={({
                bounds,
                center: nextCenter,
                zoom: nextZoom,
              }) => {
                const view = plateView.current ?? {
                  center: WORLD.center,
                  zoom: 2,
                };
                const moved =
                  Math.abs(view.zoom - nextZoom) > 0.05 ||
                  Math.abs(view.center[0] - nextCenter[0]) > 1 ||
                  Math.abs(view.center[1] - nextCenter[1]) > 1;
                startTransition(() => {
                  setCurrentBounds(bounds);
                  setCenter(nextCenter);
                  setZoom(nextZoom);
                  if (moved) setPlate(null);
                });
              }}
              maxZoom={18}
              zoomSnap={false}
            >
              <ZoomControl />
              {orgsMarkers}
            </ClusterMap>

            {/* The squares the gazetteer's references point to. */}
            <Box
              position="absolute"
              inset={0}
              pointerEvents="none"
              aria-hidden
              css={{
                '--square-line': 'rgba(5,79,69,.22)',
                _dark: { '--square-line': 'rgba(143,227,212,.2)' },
                backgroundImage:
                  'linear-gradient(to right, var(--square-line) 1px, transparent 1px), linear-gradient(to bottom, var(--square-line) 1px, transparent 1px)',
                backgroundSize: `${100 / COLUMNS.length}% 100%, 100% ${100 / ROWS.length}%`,
              }}
            />

            <Box
              position="absolute"
              top={3}
              right={3}
              px={3}
              py={1.5}
              textAlign="right"
              bg="surface"
              borderWidth="2px"
              borderColor="ink"
              pointerEvents="none"
              maxW="50%"
            >
              <Text fontFamily="heading" fontWeight="600" lineHeight="1.15">
                {plateName}
              </Text>
            </Box>

            <Box
              position="absolute"
              right={3}
              bottom={7}
              pointerEvents="none"
              textAlign="center"
              fontSize="2xs"
              fontWeight="semibold"
              color="onPop"
              hideBelow="sm"
            >
              <Box
                w={`${scale.width}px`}
                h="7px"
                border="1.5px solid #10201d"
                css={{
                  background:
                    'linear-gradient(90deg, #10201d 50%, #fbfaf2 50%)',
                }}
              />
              <Text as="span" bg="#fbfaf2" px={1}>
                {scale.km} km
              </Text>
            </Box>

            {/* The legend is also what's shown: unticking hides a kind. */}
            <Box
              position="absolute"
              left={{ base: 2, md: 3 }}
              // Under the zoom buttons on a phone: the drawer covers the bottom.
              top={{ base: '84px', md: 'auto' }}
              bottom={{ base: 'auto', md: 3 }}
              bg="surface"
              borderWidth="2px"
              borderColor="ink"
              px={3}
              py={2}
            >
              <Text
                fontSize="xs"
                fontWeight="semibold"
                mb={{ md: 1 }}
                hideBelow="md"
              >
                {t('atlas.legend')}
              </Text>
              <Box
                as="button"
                type="button"
                hideFrom="md"
                cursor="pointer"
                minH="24px"
                fontSize="xs"
                fontWeight="semibold"
                aria-expanded={legendOpen}
                onClick={() => setLegendOpen(!legendOpen)}
              >
                {t('atlas.legend')} {legendOpen ? '▾' : '▸'}
              </Box>
              <Box
                display={{ base: legendOpen ? 'block' : 'none', md: 'block' }}
              >
                <CheckboxGroup
                  value={shownKinds}
                  onValueChange={setShownKinds}
                  aria-label="Show on the map"
                >
                  <Flex direction="column" gap={1}>
                    {KINDS.map(([kind, label]) => (
                      <Checkbox.Root key={kind} value={kind} size="sm">
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label
                          display="inline-flex"
                          alignItems="center"
                          gap={1.5}
                        >
                          <AtlasMark type={kind} size={13} />
                          {t(label)}
                        </Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </Flex>
                </CheckboxGroup>
                <Switch.Root
                  size="sm"
                  mt={1.5}
                  checked={showClosed}
                  onCheckedChange={({ checked }) => setShowClosed(checked)}
                >
                  <Switch.HiddenInput />
                  <Switch.Control />
                  <Switch.Label>{t('atlas.showClosed')}</Switch.Label>
                </Switch.Root>
              </Box>
            </Box>
          </Box>
          <EdgeRefs refs={ROWS} vertical />
          <Box />
          <EdgeRefs refs={COLUMNS} />
          <Box />
        </Grid>

        <MovingBand
          label={t('atlas.gazetteer')}
          header={
            <SectionTitle
              justify={{ base: 'center', md: 'flex-start' }}
              // Clear of the drawer's handle on a phone.
              mt={{ base: 6, md: 0 }}
              mb={{ base: 2, md: 0 }}
              count={orgsInBounds.length}
              countLabel={t('atlas.entries')}
            >
              {t('atlas.gazetteer')}
            </SectionTitle>
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
                itemCount={rows.length}
                itemData={{
                  selectedId,
                  rows,
                  t,
                  onGo: goToPlace,
                  onMouseEnter: handleOrgCardEnter,
                  onMouseOut: handleOrgCardOut,
                }}
                itemSize={ROW_HEIGHT}
                style={{
                  scrollBehavior: 'smooth',
                }}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </MovingBand>
      </Flex>

      <Box
        as="section"
        aria-labelledby="atlas-contents"
        mt={10}
        mb={{ base: 24, md: 10 }}
      >
        <Flex
          justify="space-between"
          align="baseline"
          wrap="wrap"
          gap={3}
          borderBottom="2px solid"
          borderColor="ink"
          pb={2}
          mb={3}
        >
          <Heading
            as="h2"
            id="atlas-contents"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="600"
            letterSpacing="-0.02em"
          >
            {t('atlas.contents')}
          </Heading>
          <Link to="/countries" style={{ textDecoration: 'underline' }}>
            {t('atlas.allCountries')}
          </Link>
        </Flex>
        <Box
          css={{ columnCount: { base: 1, sm: 2, lg: 4 }, columnGap: '32px' }}
        >
          {contents.map(({ code, name, count }) => (
            <Link
              key={code}
              to={`/country/${code.toLowerCase()}`}
              style={{ display: 'block', breakInside: 'avoid' }}
            >
              <Flex
                align="baseline"
                gap={1.5}
                py={1}
                _hover={{ textDecoration: 'underline' }}
              >
                <Text as="span" fontWeight="semibold">
                  {name}
                </Text>
                <Box
                  flex="1"
                  minW={3}
                  borderBottom="1.5px dotted"
                  borderColor="muted"
                  transform="translateY(-3px)"
                />
                <Text
                  as="span"
                  fontSize="sm"
                  color="muted"
                  fontVariantNumeric="tabular-nums"
                >
                  {count}
                </Text>
              </Flex>
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Places;
