// Records that may be the one being added or reported (#346), for the forms'
// "Is it one of these?" and the duplicate picker.
import { DUPLICATE_KINDS, findLikelyDuplicates } from '../../data/duplicates.server';

export async function loader({ request }) {
  const params = new URL(request.url).searchParams;
  const kind = params.get('kind');
  if (!DUPLICATE_KINDS.includes(kind)) throw new Response('Bad Request', { status: 400 });
  const name = params.get('name')?.trim() ?? '';
  const site = params.get('site')?.trim() || null;
  if (name.length < 2 && !site) return { matches: [] };
  return { matches: await findLikelyDuplicates(kind, { name, site, excludeId: params.get('exclude') }) };
}
