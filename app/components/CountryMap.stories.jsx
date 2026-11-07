import CountryMap from './CountryMap';

export default {
  title: 'Map/CountryMap',
  component: CountryMap,
  args: {
    code: 'fr',
    name: 'France',
    cities: [
      { name: 'Paris', region: 'Île-de-France', latitude: 48.857, longitude: 2.352, count: 42, studios: 34, associations: 8 },
      { name: 'Lyon', region: 'Auvergne-Rhône-Alpes', latitude: 45.764, longitude: 4.835, count: 18, studios: 14, associations: 4 },
      { name: 'Nantes', region: 'Pays de la Loire', latitude: 47.218, longitude: -1.553, count: 11, studios: 7, associations: 4 },
    ],
  },
};

// A country's page: its outline (fetched from /maps/<code>.json, which only
// the app serves) and its cities.
export const Default = {};
