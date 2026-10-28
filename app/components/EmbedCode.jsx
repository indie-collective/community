import { Box, Button, Code, HStack, NativeSelect, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCopy } from 'react-icons/lu';
import { useRouteLoaderData } from 'react-router';

import { toaster } from './ui/toaster';

/**
 * "On your site" (#349): the code for an organisation's widget, its upcoming
 * events or its games, to paste in its own site.
 */
const EmbedCode = ({ org, hasGames, hasEvents }) => {
  const origin = useRouteLoaderData('root')?.origin ?? 'https://community.indieco.xyz';
  const [widget, setWidget] = useState(hasEvents ? 'events' : 'games');
  const code = `<iframe src="${origin}/embed/org/${org.slug || org.id}/${widget}" width="100%" height="400" style="border:0" title="${
    widget === 'events' ? 'Upcoming events' : 'Games'
  } of ${org.name.replace(/"/g, '&quot;')}"></iframe>`;
  return (
    <Box as="section" mb={{ base: 8, md: 10 }} aria-labelledby="embed" maxW="2xl">
      <Text as="h2" id="embed" fontWeight="semibold" mb={1}>
        On your site
      </Text>
      <Text fontSize="sm" color="muted" mb={2}>
        Show {org.name}&apos;s {widget === 'events' ? 'upcoming events' : 'games'} on any site: paste this code where
        they should be. It stays up to date.
      </Text>
      <HStack mb={2}>
        {hasEvents && hasGames && (
          <NativeSelect.Root size="sm" width="auto">
            <NativeSelect.Field aria-label="Widget" value={widget} onChange={(event) => setWidget(event.target.value)}>
              <option value="events">Upcoming events</option>
              <option value="games">Games</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              toaster.create({ title: 'Code copied', type: 'success' });
            } catch {
              toaster.create({ title: "Couldn't copy it: select it instead", type: 'error' });
            }
          }}
        >
          <LuCopy />
          Copy the code
        </Button>
      </HStack>
      <Code display="block" whiteSpace="pre-wrap" overflowWrap="anywhere" p={3} fontSize="xs" data-testid="embed-code">
        {code}
      </Code>
    </Box>
  );
};

export default EmbedCode;
