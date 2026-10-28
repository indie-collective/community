import { Box } from '@chakra-ui/react';
import { Map } from 'pigeon-maps';
import { useEffect, useRef, useState } from 'react';

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

// Maps load only once they're near the screen (#350): their tiles are the
// heaviest part of a page, and many maps sit below the fold.
const useNearScreen = () => {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return setNear(true);
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: '300px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, near];
};

// The wrapper fills its parent like the map did before it (#375): in a flex
// row (the places page, beside its list) it takes the room that's left,
// rather than shrinking to its content, which is the map's 100% of nothing.
const TileMap = (props) => {
  const [ref, near] = useNearScreen();
  return (
    <Box
      ref={ref}
      css={tileStyle}
      width="100%"
      flex="1 1 0"
      minWidth={0}
      height="100%"
      minHeight="1px"
    >
      {near && <Map {...props} provider={tileProvider} />}
    </Box>
  );
};

export default TileMap;
