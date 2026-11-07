import PlacesSearch from './PlacesSearch';

export default {
  title: 'Forms/PlacesSearch',
  component: PlacesSearch,
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

// Suggestions come from Mapbox, and venues from the app (#390).
export const Default = {};
export const WithVenues = { args: { venues: true } };
