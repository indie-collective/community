import { expect, within } from 'storybook/test';

import { DuplicateHint, ReportDuplicate } from './Duplicates';

const matches = [{ id: 'g2', slug: 'moss-garden', name: 'Moss Garden' }];

export default {
  title: 'Forms/Duplicates',
  component: DuplicateHint,
  parameters: {
    router: { routes: [{ path: 'duplicates', loader: () => ({ matches }) }] },
  },
};

// While typing a name in a form: records that may be the same one.
export const Hint = {
  render: () => <DuplicateHint kind="game" name="Moss Gardens" />,
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('Moss Garden')).toBeVisible();
  },
};

// On a record's page: report that it duplicates another.
export const Report = {
  render: () => <ReportDuplicate kind="game" id="g1" isOpen onClose={() => {}} />,
};
