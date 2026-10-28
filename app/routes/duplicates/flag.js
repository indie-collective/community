// A member reports two records as the same one (#346), for admins to merge.
import { DUPLICATE_KINDS, flagDuplicate } from '../../data/duplicates.server';
import { authorizer, canWrite } from '../../utils/auth.server';

export async function action(args) {
  const currentUser = await authorizer.authorize(args, { rules: [canWrite] });
  const data = await args.request.formData();
  const kind = data.get('kind');
  if (!DUPLICATE_KINDS.includes(kind) || !data.get('id') || !data.get('other')) {
    throw new Response('Bad Request', { status: 400 });
  }
  await flagDuplicate(kind, data.get('id'), data.get('other'), { personId: currentUser.id });
  return { flagged: true };
}
