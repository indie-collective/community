import PrefillFromLink from './PrefillFromLink';

export default {
  title: 'Forms/PrefillFromLink',
  component: PrefillFromLink,
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
  args: { onFields: () => {} },
};

// Fill a form from a Steam, itch.io, Bluesky or website link.
export const Game = { args: { kind: 'game' } };
export const Organization = { args: { kind: 'organization' } };
export const Event = { args: { kind: 'event' } };
