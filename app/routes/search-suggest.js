// What the header's search box suggests as people type (#306): the best
// few matches of any kind. A resource route: data only.
import { suggestSearch } from '../data/site.server';

export async function loader({ request }) {
  const q = new URL(request.url).searchParams.get('q');
  return { q: q ?? '', suggestions: await suggestSearch(q) };
}
