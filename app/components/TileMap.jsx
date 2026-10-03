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

const TileMap = (props) => <Map {...props} provider={tileProvider} />;

export default TileMap;
