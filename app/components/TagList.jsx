import { Flex, Tag } from '@chakra-ui/react';
import { Link } from 'react-router';

/**
 * A game's tags as a list, so screen readers, copy-paste and crawlers get
 * separate items instead of one run-on word (#201). With `linked`, each
 * tag links to the games list filtered by it.
 */
const TagList = ({ tags, size = 'sm', fontSize = '0.6rem', linked = false, ...rest }) => (
  <Flex
    as="ul"
    aria-label="Tags"
    wrap="wrap"
    gap={1}
    listStyleType="none"
    fontWeight="semibold"
    letterSpacing="wide"
    textTransform="uppercase"
    {...rest}
  >
    {tags.map((tag) => {
      const chip = (
        <Tag.Root
          size={size}
          colorPalette="green"
          variant="solid"
          fontSize={fontSize}
          {...(linked && { _hover: { opacity: 0.8 } })}
        >
          {tag.name}
        </Tag.Root>
      );
      return (
        <li key={tag.id}>
          {linked ? <Link to={`/games?tags=${encodeURIComponent(tag.name)}`}>{chip}</Link> : chip}
        </li>
      );
    })}
  </Flex>
);

export default TagList;
