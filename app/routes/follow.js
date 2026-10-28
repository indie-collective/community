// Following or unfollowing a game, organisation, event or country (#343).
import { FOLLOW_TYPES, setFollowing } from '../data/notifications.server';
import { authorizer } from '../utils/auth.server';

export async function action(args) {
  const currentUser = await authorizer.authorize(args);
  const data = await args.request.formData();
  const type = data.get('type');
  const id = data.get('id');
  if (!FOLLOW_TYPES.includes(type) || !id) throw new Response('Bad Request', { status: 400 });
  const following = data.get('follow') === 'on';
  await setFollowing(currentUser.id, type, type === 'country' ? id.toUpperCase() : id, following);
  return { following };
}
