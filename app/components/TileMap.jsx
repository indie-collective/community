import { Map } from 'pigeon-maps';

/**
 * The one place raster map tiles are configured (#212): every pigeon-maps
 * map renders through TileMap, so switching provider later is a change here
 * only. Event pages draw OpenFreeMap's vector tiles instead (EventMap, #322).
 *
 * OpenStreetMap's standard tiles for now, from the single documented host
 * (no a./b./c. subdomains, no "@2x" variants, which it doesn't serve).
 * pigeon-maps' default attribution credits OpenStreetMap contributors.
 */
export const tileProvider = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const TileMap = (props) => <Map {...props} provider={tileProvider} />;

export default TileMap;
