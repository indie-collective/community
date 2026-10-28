import { setGameImageAlt } from '../../data/games.server';
import { authorizer, canWrite } from '../../utils/auth.server';
import { routeRecordId } from '../../utils/pageRecord.server';

// Describing what a game's image shows (#350). Called by fetchers.
export async function action(args) {
  const id = await routeRecordId('game', args.params.id);
  const currentUser = await authorizer.authorize(args, { rules: [canWrite] });
  const data = await args.request.formData();
  await setGameImageAlt(id, data.get('id'), data.get('alt'), { authorId: currentUser.id });
  return { ok: true };
}
