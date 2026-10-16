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

/**
 * Quieter tiles (#322): Stadia Maps' Alidade Smooth, and Alidade Smooth
 * Dark in dark mode, with retina variants. Stadia authenticates by domain
 * (registered in its dashboard), so there's no key here; localhost works
 * without one. `land` is the style's background, shown in the hairline
 * gaps between tiles.
 */
export const SMOOTH_TILES = {
  light: { style: 'alidade_smooth', land: '#f2f3f0' },
  dark: { style: 'alidade_smooth_dark', land: '#333333' },
};

const smoothProvider = (style) => (x, y, z, dpr) =>
  `https://tiles.stadiamaps.com/tiles/${style}/${z}/${x}/${y}${dpr >= 2 ? '@2x' : ''}.png`;

const smoothAttribution = (
  <>
    <a href="https://stadiamaps.com/" target="_blank" rel="noopener noreferrer">
      © Stadia Maps
    </a>{' '}
    <a
      href="https://openmaptiles.org/"
      target="_blank"
      rel="noopener noreferrer"
    >
      © OpenMapTiles
    </a>{' '}
    <a
      href="https://www.openstreetmap.org/copyright"
      target="_blank"
      rel="noopener noreferrer"
    >
      © OpenStreetMap
    </a>
  </>
);

/**
 * The map. `tiles="smooth"` uses the quieter tiles, `dark` their dark
 * variant; otherwise OpenStreetMap's.
 */
const TileMap = ({ tiles, dark = false, ...props }) =>
  tiles === 'smooth' ? (
    <Map
      {...props}
      provider={smoothProvider(SMOOTH_TILES[dark ? 'dark' : 'light'].style)}
      dprs={[1, 2]}
      attribution={smoothAttribution}
      attributionPrefix={false}
    />
  ) : (
    <Map {...props} provider={tileProvider} />
  );

export default TileMap;
