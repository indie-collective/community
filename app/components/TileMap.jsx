import { Box } from '@chakra-ui/react';
import { Map } from 'pigeon-maps';

/**
 * The one place map tiles are configured (#212): every map renders through
 * TileMap, so switching provider later is a change here only.
 *
 * OpenStreetMap's standard tiles for now, from the single documented host
 * (no a./b./c. subdomains, no "@2x" variants, which it doesn't serve).
 * pigeon-maps' default attribution credits OpenStreetMap contributors.
 */
export const tileProvider = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

// Calmer tiles that sit with the site's colours (#322): muted in light mode,
// inverted to a dark map in dark mode. Only the tiles: pins keep their colour.
const TILES = 'img[src^="https://tile.openstreetmap.org/"]';
const tileStyle = {
  [`& ${TILES}`]: { filter: 'saturate(0.45) brightness(1.04) contrast(0.92)' },
  _dark: {
    [`& ${TILES}`]: {
      filter: 'invert(1) hue-rotate(180deg) saturate(0.4) brightness(0.9) contrast(0.85)',
    },
  },
};

const TileMap = (props) => (
  <Box css={tileStyle} height="100%">
    <Map {...props} provider={tileProvider} />
  </Box>
);

export default TileMap;
