import { Link as ChakraLink } from '@chakra-ui/react';

import Link from './Link';

/** A member's username, linking to their public profile (#341). */
const PersonLink = ({ username, fallback = 'Unknown', ...props }) =>
  username ? (
    <ChakraLink asChild {...props}>
      <Link to={`/people/${username}`}>@{username}</Link>
    </ChakraLink>
  ) : (
    fallback
  );

export default PersonLink;
