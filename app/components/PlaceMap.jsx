import { Box, Flex, Link as ChakraLink, Text } from '@chakra-ui/react';
import { Overlay } from 'pigeon-maps';
import { LuExternalLink, LuMapPin } from 'react-icons/lu';

import Link from './Link';
import MapPin from './MapPin';
import TileMap from './TileMap';

// Far enough out to see the city and around it, so people can place the
// pin (#337): street level showed a few unnamed streets.
export const CITY_ZOOM = 11;

const PIN_SIZE = 40;

/** OpenStreetMap at street level around the place, for a closer look. */
export const openStreetMapUrl = ({ latitude, longitude }) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

/** /places opened on the place, with the record's card picked (#322). */
export const placesUrl = ({ latitude, longitude }, id) =>
  `/places?at=${latitude},${longitude}${id ? `#${id}` : ''}`;

/**
 * A banner map of where an event or organisation is: the city around it,
 * with a pin on it, and its address. The map itself isn't interactive, so it
 * doesn't catch page scrolling: it opens the places map there, and a link
 * opens OpenStreetMap for directions.
 */
const PlaceMap = ({ location, id, color, logo, label, address }) => {
  const anchor = [location.latitude, location.longitude];
  return (
    <Box as="figure" mb={{ base: 8, md: 10 }}>
      <ChakraLink
        asChild
        display="block"
        height={['160px', '220px']}
        overflow="hidden"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        transition="box-shadow 0.2s"
        _hover={{ boxShadow: 'md' }}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: 'colorPalette.focusRing',
          outlineOffset: '2px',
        }}
      >
        <Link
          to={placesUrl(location, id)}
          aria-label={`Map of ${label}: open on the places map`}
        >
          <TileMap
            defaultWidth={1200}
            defaultHeight={220}
            center={anchor}
            zoom={CITY_ZOOM}
            mouseEvents={false}
            touchEvents={false}
            // Credited in the caption: links can't sit inside this link.
            attribution={false}
          >
            {/* The pin's tip on the place. */}
            <Overlay anchor={anchor} offset={[PIN_SIZE / 2, PIN_SIZE]}>
              <MapPin color={color} logo={logo} size={PIN_SIZE} />
            </Overlay>
          </TileMap>
        </Link>
      </ChakraLink>
      <Flex
        as="figcaption"
        mt={2}
        gap={3}
        wrap="wrap"
        justify="space-between"
        fontSize="sm"
      >
        {address && (
          <Text color="muted" display="flex" alignItems="center" gap={1}>
            <LuMapPin />
            {address}
          </Text>
        )}
        <ChakraLink
          href={openStreetMapUrl(location)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on OpenStreetMap
          <LuExternalLink />
        </ChakraLink>
      </Flex>
      <Text fontSize="xs" color="muted" mt={1}>
        Map ©{' '}
        <ChakraLink href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </ChakraLink>{' '}
        contributors
      </Text>
    </Box>
  );
};

export default PlaceMap;
