import { Link as RouterLink } from 'react-router';

/**
 * React Router's Link, navigating with a view transition (design pass): the
 * page cross-fades, and a card's image moves into the page it opens (see
 * CardLink). Browsers without view transitions navigate as before.
 */
export default function Link({ ref, viewTransition = true, ...props }) {
  return <RouterLink ref={ref} viewTransition={viewTransition} {...props} />;
}
