import MapboxAutocomplete from './MapboxAutocomplete';

export default {
  title: 'Forms/MapboxAutocomplete',
  component: MapboxAutocomplete,
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
  // Suggestions need a Mapbox token and a connection; the field itself
  // shows without them.
  args: { token: '', placeholder: 'Search for a place', onSuggestionSelect: () => {} },
};

export const Default = {};
