import { Link as ChakraLink, Text } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';

const NAMES = { steam: 'Steam', itch: 'itch.io', bluesky: 'Bluesky', website: 'its website' };

/**
 * Where a field came from (#338), when a source filled it in and it's
 * unchanged since: "Description from Steam". Others' texts belong to them.
 */
const SourceCredit = ({ sources = [], field, value, label = 'Description' }) => {
  const source = value && sources.find((candidate) => candidate.filled?.[field] === value);
  if (!source) return null;
  return (
    <Text fontSize="sm" color="muted" mt={2} data-testid="source-credit">
      {label} from{' '}
      <ChakraLink href={source.url} target="_blank" rel="noopener noreferrer">
        {NAMES[source.source]}
        <LuExternalLink />
      </ChakraLink>
    </Text>
  );
};

export default SourceCredit;
