import MissionInput from './MissionInput';

export default {
  title: 'Missions/MissionInput',
  component: MissionInput,
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
  parameters: { router: { routes: [{ path: 'search-org', loader: () => [] }] } },
};

// What a mission asks for, by the kind of gap it fills.
export const Description = { args: { kind: 'game', gap: { key: 'about', input: 'text' } } };
export const Website = { args: { kind: 'organization', gap: { key: 'site', input: 'url' } } };
export const Tags = { args: { kind: 'game', gap: { key: 'tags', input: 'tags' } } };
export const Organization = { args: { kind: 'game', gap: { key: 'studio', input: 'organization' } } };
export const Image = { args: { kind: 'organization', gap: { key: 'logo', input: 'image' } } };
export const Milestone = { args: { kind: 'game', gap: { key: 'milestone', input: 'milestone' } } };
