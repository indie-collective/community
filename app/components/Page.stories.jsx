import { Button, Text } from '@chakra-ui/react';
import { expect, within } from 'storybook/test';

import Empty from './Empty';
import { FilterBar, Page, PageHeader, Section } from './Page';

export default {
  title: 'Layout/Page',
  component: Page,
  parameters: { layout: 'fullscreen' },
};

// The parts every page is built from: its header, sections and the panel
// of filters above a list.
export const ListPage = {
  render: () => (
    <Page>
      <PageHeader
        title="Studios"
        description="Studios making independent games, from around the world."
        actions={<Button size="sm">Add a studio</Button>}
      />
      <FilterBar>
        <Text fontSize="sm">Filters go here</Text>
      </FilterBar>
      <Section title="Recently updated" aside={<Text color="muted">12</Text>}>
        <Text>{"The section's content."}</Text>
      </Section>
      <Section title="Nothing here yet">
        <Empty>Nothing here yet</Empty>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Studios' })).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Recently updated' })).toBeVisible();
  },
};

// The homepage's sections: a heavy rule, an optional line above the title,
// and a link to the full list.
export const BigSections = {
  render: () => (
    <Page>
      <Section big kicker="Recently updated" title="Games" to="/games" linkLabel="All games">
        <Text>{"The section's content."}</Text>
      </Section>
      <Section big title="Studios" to="/studios" linkLabel="All studios">
        <Text>{"The section's content."}</Text>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Games' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: /All games/ })).toHaveAttribute('href', '/games');
  },
};

// #197: the count sits beside the heading, not in it.
export const CountedHeading = {
  render: () => (
    <Section title="Games" count={23} countLabel="games" to="/games" linkLabel="All 23">
      <Text>{"The section's content."}</Text>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: /^Games 23 games/ })).toBeVisible();
  },
};

export const Dark = { ...ListPage, globals: { colorMode: 'dark' } };
