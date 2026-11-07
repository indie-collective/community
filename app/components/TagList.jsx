import { Flex } from '@chakra-ui/react';

import Chip from './Chip';
import Link from './Link';

/**
 * A game's tags as a list, so screen readers, copy-paste and crawlers get
 * separate items instead of one run-on word (#201). With `linked`, each
 * tag links to the games list filtered by it.
 */
const TagList = ({ tags, size = 'sm', linked = false, ...rest }) => (
  <Flex as="ul" aria-label="Tags" wrap="wrap" gap={1} listStyleType="none" {...rest}>
    {tags.map((tag) => (
      <li key={tag.id}>
        {linked ? (
          <Chip size={size} asChild>
            <Link to={`/games?tags=${encodeURIComponent(tag.name)}`}>{tag.name}</Link>
          </Chip>
        ) : (
          <Chip size={size}>{tag.name}</Chip>
        )}
      </li>
    ))}
  </Flex>
);

export default TagList;
