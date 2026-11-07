import FollowButton from './FollowButton';

export default {
  title: 'Buttons/FollowButton',
  component: FollowButton,
  args: { type: 'org', id: 'org-1' },
};

export const NotFollowing = { args: { following: false } };
export const Following = { args: { following: true } };
