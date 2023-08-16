/**
 * This "catch all" route is used to display the navigation and footer
 * along with the 404 error.
 */
import Error from '../components/Error';

export const loader = async () => {
  throw new Response('Not Found', { status: 404 });
};

export default function NotFound() {
  return <Error statusCode={404} />;
}
