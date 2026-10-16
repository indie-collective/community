import { Box, HStack, Text } from '@chakra-ui/react';
import { Overlay } from 'pigeon-maps';
import { LuExternalLink } from 'react-icons/lu';

import MapPin from './MapPin';
import TileMap from './TileMap';
import { pinColor } from '../utils/orgTypes';

const PIN_SIZE = 48;

/**
 * Where to send people from the map: the place in their maps app (Google
 * Maps' cross-platform link opens the app on phones, the site elsewhere).
 */
const mapsUrl = ({ latitude, longitude }) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

/**
 * An event page's map (#322): the venue under an event pin, on tiles toned
 * down to sit with the page (and darkened in dark mode). The whole map
 * opens the place in a maps app.
 */
export default function EventMap({ location }) {
  const center = [location.latitude, location.longitude];

  return (
    <Box
      position="relative"
      height={{ base: '160px', md: '240px' }}
      overflow="hidden"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={{ base: 'gray.200', _dark: 'gray.800' }}
      bg="surface"
      css={{
        // OpenStreetMap's tiles, quieter: less saturated in light mode,
        // inverted to a dark map in dark mode. Only the tiles: the pin keeps
        // its colour. The land colour behind them, so the hairline gaps
        // between tiles don't show the page through.
        '& .pigeon-tiles': {
          background: '#f2efe9',
          filter: 'grayscale(0.5) contrast(0.9) brightness(1.04)',
        },
        _dark: {
          '& .pigeon-tiles': {
            filter:
              'invert(1) hue-rotate(180deg) grayscale(0.4) brightness(0.85) contrast(0.9)',
          },
          // pigeon-maps styles the credits inline, hence !important.
          '& .pigeon-attribution': {
            background: 'rgba(0, 0, 0, 0.6) !important',
            color: '#d4d4d8 !important',
          },
          '& .pigeon-attribution a': { color: '#93c5fd !important' },
        },
        // Above the link, so the credits stay clickable.
        '& .pigeon-attribution': { zIndex: 2 },
        _hover: { '& [data-maps-cta]': { bg: 'surface' } },
      }}
    >
      <TileMap
        defaultWidth={1200}
        defaultHeight={240}
        center={center}
        zoom={location.street ? 15 : 11}
        mouseEvents={false}
        touchEvents={false}
      >
        <Overlay anchor={center} offset={[PIN_SIZE / 2, PIN_SIZE]}>
          <Box filter="drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))">
            <MapPin color={pinColor('event')} size={PIN_SIZE} />
          </Box>
        </Overlay>
      </TileMap>

      <Box
        as="a"
        href={mapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        position="absolute"
        inset={0}
        zIndex={1}
        borderRadius="xl"
        _focusVisible={{ outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '-2px' }}
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
