import { Box } from '@chakra-ui/react';
import { Overlay } from 'pigeon-maps';

import TileMap from '../TileMap';

/**
 * A small, still map of one place with a pin (design pass), for fact
 * sheets: closer in for a street address, a city otherwise.
 */
const PlaceMap = ({ latitude, longitude, street = false, height = 140 }) => (
  <Box
    height={`${height}px`}
    borderTopWidth="1px"
    borderColor="border"
    role="img"
    aria-label="Map of the place"
  >
    <TileMap
      height={height}
      defaultCenter={[latitude, longitude]}
      defaultZoom={street ? 15 : 11}
      mouseEvents={false}
      touchEvents={false}
    >
      <Overlay anchor={[latitude, longitude]} offset={[8, 8]}>
        <Box
          boxSize="16px"
          borderRadius="full"
          bg="kind.event"
          borderWidth="3px"
          borderColor="white"
          shadow="md"
        />
      </Overlay>
    </TileMap>
  </Box>
);

export default PlaceMap;
