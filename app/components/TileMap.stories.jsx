import TileMap from './TileMap';

export default {
  title: 'Map/TileMap',
  component: TileMap,
  decorators: [(Story) => <div style={{ height: 360 }}><Story /></div>],
  args: { defaultCenter: [47.218, -1.553], defaultZoom: 11 },
};

// Every map on the site: OpenStreetMap tiles, tinted to the page's colours.
export const Default = {};
export const Dark = { globals: { colorMode: 'dark' } };
