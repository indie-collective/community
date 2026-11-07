import EmbedCode from './EmbedCode';

export default {
  title: 'Organisations/EmbedCode',
  component: EmbedCode,
  args: { org: { id: 's1', slug: 'pixel-moss', name: 'Pixel Moss' }, hasGames: true, hasEvents: true },
};

// The code to put an organisation's games or events on its own site.
export const Default = {};
