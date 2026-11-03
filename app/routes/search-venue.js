// Venues matching what's typed in the event form's place field (#390). A
// resource route: data only.
import { searchVenues } from '../data/venues.server';

export async function loader({ request }) {
  return searchVenues(new URL(request.url).searchParams.get('q'));
}
