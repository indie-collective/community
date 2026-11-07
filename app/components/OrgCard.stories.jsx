import { expect, within } from 'storybook/test';

import OrgCard from './OrgCard';

export default {
  title: 'Cards/OrgCard',
  component: OrgCard,
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  args: {
    id: 'org-1',
    type: 'studio',
    name: 'Frami, Abernathy and Dickens',
    location: { city: 'Valentinfurt', region: 'Colorado', country_code: 'NI' },
  },
};

export const Studio = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Frami, Abernathy and Dickens' });
    await expect(link).toHaveAttribute('href', '/org/org-1');
    await expect(getComputedStyle(link).color).toBe(
      getComputedStyle(link.closest('h3, h2, p, div')).color
    );
    await expect(canvas.getByText(/Studio · Valentinfurt, NI/)).toBeVisible();
  },
};

export const Association = { args: { type: 'association', name: 'Feeney and Sons' } };

export const Dark = { ...Studio, globals: { colorMode: 'dark' } };

// The homepage's studios and associations: a round logo and the name.
export const Badge = {
  decorators: [(Story) => <div style={{ width: 140 }}><Story /></div>],
  args: { variant: 'badge' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Frami, Abernathy and Dickens' })).toHaveAttribute('href', '/org/org-1');
    await expect(canvas.getByText(/Valentinfurt/)).toBeVisible();
  },
};

export const BadgeAssociation = {
  decorators: Badge.decorators,
  args: { variant: 'badge', type: 'association', name: 'Feeney and Sons' },
};
