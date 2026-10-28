// Taking an opportunity down (#345): its author or an admin.
import { deleteOpportunity, getOpportunity } from '../data/opportunities.server';
import { authorizer, canWrite } from '../utils/auth.server';

export async function action(args) {
  const currentUser = await authorizer.authorize(args, { rules: [canWrite] });
  const opportunity = await getOpportunity(args.params.id);
  if (!opportunity) throw new Response('Not Found', { status: 404 });
  if (!currentUser.isAdmin && opportunity.author_id !== currentUser.id) {
    throw new Response('Forbidden', { status: 403 });
  }
  await deleteOpportunity(opportunity.id, { authorId: currentUser.id });
  return { deleted: true };
}
