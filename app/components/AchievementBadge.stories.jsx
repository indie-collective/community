import AchievementShelf from './AchievementBadge';

const achievements = [
  { key: 'first-find', tier: 'bronze', name: 'First find', description: 'Added a first record.' },
  { key: 'cartographer', tier: 'silver', name: 'Cartographer', description: 'Placed 25 organisations on the map.' },
  { key: 'records-100', tier: 'gold', name: 'Archivist', description: 'Added 100 records.' },
  { key: 'records-1000', tier: 'platinum', name: 'Librarian', description: 'Added 1,000 records.', earned: false, value: 312, target: 1000 },
];

export default {
  title: 'Profile/AchievementShelf',
  component: AchievementShelf,
  args: { achievements },
};

export const Default = {};
export const Large = { args: { size: 'lg' } };
export const Dark = { globals: { colorMode: 'dark' } };
