import { expect, within } from 'storybook/test';

import CityList from './CityList';

const cities = [
  { name: 'Paris', region: 'Île-de-France', count: 42, studios: 34, associations: 8 },
  { name: 'Lyon', region: 'Auvergne-Rhône-Alpes', count: 18, studios: 14, associations: 4 },
  { name: 'Nantes', region: 'Pays de la Loire', count: 11, studios: 7, associations: 4 },
  { name: 'Rennes', region: 'Bretagne', count: 6, studios: 3, associations: 3 },
];

export default {
  title: 'Map/CityList',
  component: CityList,
  args: { cities },
};

// #258: a country's biggest cities, with the studio and association split.
export const Default = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Paris')).toBeVisible();
  },
};

export const Empty = { args: { cities: [] } };

export const Dark = { ...Default, globals: { colorMode: 'dark' } };
