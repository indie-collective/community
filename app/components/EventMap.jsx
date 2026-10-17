import { useEffect, useRef } from 'react';
import { Box, ClientOnly, HStack, Text } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';
import 'maplibre-gl/dist/maplibre-gl.css';

import MapPin from './MapPin';
import { useColorMode } from './ui/color-mode';
import { pinColor } from '../utils/orgTypes';

const PIN_SIZE = 48;

/**
 * OpenFreeMap's vector styles (#322): free, with no account or key. Bright,
 * and Fiord in dark mode (its Dark is near black). `land` is each style's
 * background, shown until the tiles draw.
 */
const STYLES = {
  light: { url: 'https://tiles.openfreemap.org/styles/bright', land: '#f8f4f0' },
  dark: { url: 'https://tiles.openfreemap.org/styles/fiord', land: '#45516e' },
};

/**
 * Where to send people from the map: the place in their maps app (Google
 * Maps' cross-platform link opens the app on phones, the site elsewhere).
 */
const mapsUrl = ({ latitude, longitude }) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

/**
 * The tiles, drawn by MapLibre, loaded only on pages with a map. Its tiles
 * are 512px, so its zoom is one less than pigeon-maps' for the same view.
 */
function VectorMap({ location, style }) {
  const container = useRef();

  useEffect(() => {
    // Effects never run on the server: this keeps MapLibre out of its bundle.
    if (import.meta.env.SSR) return;
    let map;
    let cancelled = false;
    Promise.all([
      import('maplibre-gl'),
      // Vite's dependency bundling breaks MapLibre's own path to its worker.
      import('maplibre-gl/dist/maplibre-gl-worker.mjs?url'),
    ]).then(([maplibregl, { default: workerUrl }]) => {
      if (cancelled) return;
      maplibregl.setWorkerUrl(workerUrl);
      map = new maplibregl.Map({
        container: container.current,
        style,
        center: [location.longitude, location.latitude],
        zoom: location.street ? 14 : 10,
        interactive: false,
        attributionControl: { compact: true },
      });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [location.latitude, location.longitude, location.street, style]);

  return <Box ref={container} position="absolute" inset={0} />;
}

/**
 * An event page's map (#322): the venue under an event pin, on OpenFreeMap
 * (Fiord in dark mode). The whole map opens the place in a maps app.
 */
export default function EventMap({ location }) {
  const dark = useColorMode().colorMode === 'dark';

  return (
    <Box
      position="relative"
      height={{ base: '160px', md: '240px' }}
      overflow="hidden"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={{ base: 'gray.200', _dark: 'gray.800' }}
      bg={{ base: STYLES.light.land, _dark: STYLES.dark.land }}
      css={{
        _dark: {
          '& .maplibregl-ctrl-attrib': {
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#d4d4d8',
          },
          '& .maplibregl-ctrl-attrib a': { color: '#93c5fd' },
          '& .maplibregl-ctrl-attrib-button': { filter: 'invert(1)' },
        },
        '& .maplibregl-ctrl-attrib': { fontSize: '10px' },
        _hover: { '& [data-maps-cta]': { bg: 'surface' } },
      }}
    >
      {/* After hydration, once the colour mode is known: the server renders
          light, and dark-mode visitors would see the light map flash first.
          Until then, the box shows the style's land colour. */}
      <ClientOnly>
        {() => (
          <VectorMap
            location={location}
            style={STYLES[dark ? 'dark' : 'light'].url}
          />
        )}
      </ClientOnly>

      {/* The map doesn't move, so the pin sits at its centre: its tip on the
          venue. */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -100%)"
        filter="drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))"
        pointerEvents="none"
      >
        <MapPin color={pinColor('event')} size={PIN_SIZE} />
      </Box>

      {/* Below the map's credits (MapLibre's controls sit at z-index 2), so
          they stay clickable. */}
      <Box
        as="a"
        href={mapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        position="absolute"
        inset={0}
        zIndex={1}
        borderRadius="xl"
        _focusVisible={{
          outline: '2px solid',
          outlineColor: 'colorPalette.focusRing',
          outlineOffset: '-2px',
        }}
      >
        <HStack
          data-maps-cta=""
          position="absolute"
          left={3}
          bottom={3}
          gap={1.5}
          px={3}
          py={1.5}
          borderRadius="full"
          bg={{ base: 'whiteAlpha.900', _dark: 'blackAlpha.700' }}
          boxShadow="sm"
          fontSize="sm"
          fontWeight="medium"
          transition="background 0.2s"
        >
          <Text as="span">Open in Maps</Text>
          <LuExternalLink aria-hidden />
        </HStack>
      </Box>
    </Box>
  );
}
