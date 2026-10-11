import { Text } from '@chakra-ui/react';

// The search index marks matched words with these (data/search.server).
const START = '\u0002';
const END = '\u0003';

// What each field is called, by kind of record (see search_documents).
// Not tags or places: cards show them.
const FIELDS = {
  related: (kind) => ({ game: 'By', event: 'With' })[kind] ?? 'Games',
  about: () => null,
};

/** A snippet's text as parts, the matched words in <mark>. */
export function markedParts(text) {
  return text
    .split(START)
    .flatMap((part, index) => {
      if (index === 0) return [{ text: part, matched: false }];
      const [matched, rest = ''] = part.split(END);
      return [
        { text: matched, matched: true },
        { text: rest, matched: false },
      ];
    })
    .filter((part) => part.text);
}

/**
 * Why a search result matched (#306), when it isn't its name: the studio,
 * game or bit of description the query found, words marked.
 */
const SearchMatch = ({ kind, match }) => {
  if (!match || !FIELDS[match.field]) return null;
  const label = FIELDS[match.field](kind);
  return (
    <Text fontSize="sm" color="muted" mt={1} px={1} lineClamp={2}>
      {label && (
        <Text as="span" fontWeight="semibold">
          {label}:{' '}
        </Text>
      )}
      {markedParts(match.text).map(({ text, matched }, index) =>
        matched ? (
          <Text
            as="mark"
            key={index}
            bg={{ base: 'yellow.100', _dark: 'yellow.800' }}
            color="inherit"
            px="1px"
            borderRadius="sm"
          >
            {text}
          </Text>
        ) : (
          text
        )
      )}
    </Text>
  );
};

export default SearchMatch;
