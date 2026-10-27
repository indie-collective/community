import { Box, Link as ChakraLink } from '@chakra-ui/react';
import { Overlay } from 'pigeon-maps';
import { LuExternalLink } from 'react-icons/lu';

import MapPin from './MapPin';
import TileMap from './TileMap';

// Far enough out to see the city and around it, so people can place the
// pin (#337): street level showed a few unnamed streets.
export const CITY_ZOOM = 11;

const PIN_SIZE = 40;

/** OpenStreetMap at street level around the place, for a closer look. */
export const openStreetMapUrl = ({ latitude, longitude }) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

/**
 * A banner map of where an event or organisation is: the city around it,
 * with a pin on it. Not interactive, so it doesn't catch page scrolling; a
 * link opens OpenStreetMap for a closer look.
 */
const PlaceMap = ({ location, color, logo, label }) => {
  const anchor = [location.latitude, location.longitude];
  return (
    <Box position="relative" mb={{ base: 8, md: 10 }}>
      <Box
        height={['160px', '220px']}
        overflow="hidden"
        borderRadius="xl"
        role="img"
        aria-label={`Map of ${label}`}
      >
        <TileMap
          defaultWidth={1200}
          defaultHeight={220}
          center={anchor}
          zoom={CITY_ZOOM}
          mouseEvents={false}
          touchEvents={false}
        >
          {/* The pin's tip on the place. */}
          <Overlay anchor={anchor} offset={[PIN_SIZE / 2, PIN_SIZE]}>
            <MapPin color={color} logo={logo} size={PIN_SIZE} />
          </Overlay>
        </TileMap>
      </Box>
      <ChakraLink
        href={openStreetMapUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        fontSize="sm"
        mt={2}
      >
        View on OpenStreetMap
        <LuExternalLink />
      </ChakraLink>
    </Box>
  );
};

export default PlaceMap;
