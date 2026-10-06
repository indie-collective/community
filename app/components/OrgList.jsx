import { Box, Button, Center, Grid, Presence } from '@chakra-ui/react';
import { useState } from 'react';
import { useFetcher, useLocation } from 'react-router';

import OrgCard from './OrgCard';

/**
 * The grid of org cards for the studios and associations lists, and a
 * "Load more" button that fetches the next page with the same filters.
 * Takes the route's loader data: `orgs`, `hasMore` and `page`. Render it with
 * `key={location.search}` so it starts over when the filters change.
 */
const OrgList = ({ orgs: firstOrgs, hasMore: firstHasMore, page: firstPage }) => {
  const location = useLocation();
  const fetcher = useFetcher();
  // Pages loaded before the one the fetcher holds now.
  const [loaded, setLoaded] = useState([]);

  // Derived during render rather than copied in an effect: the fetcher's
  // latest page is shown as soon as it arrives.
  const latest = fetcher.data;
  const page = latest?.page ?? firstPage;
  const hasMore = latest?.hasMore ?? firstHasMore;
  const seen = new Set();
  const orgs = [...firstOrgs, ...loaded, ...(latest?.orgs ?? [])].filter(
    (org) => !seen.has(org.id) && seen.add(org.id)
  );

  const loadMore = () => {
    if (latest) setLoaded((prev) => [...prev, ...latest.orgs]);
    const params = new URLSearchParams(location.search);
    params.set('page', String(page + 1));
    fetcher.load(`${location.pathname}?${params}`);
  };

  return (
    <>
      <Grid
        gap={5}
        templateColumns={[
          '1fr',
          'repeat(2, 1fr)',
          'repeat(3, 1fr)',
          'repeat(4, 1fr)',
        ]}
      >
        {orgs.map((org) => (
          <Box key={org.id} minW={0}>
            <Presence
              present
              animationName={{
                _open: 'fade-in',
                _closed: 'fade-out'
              }}
              animationDuration='moderate'>
              <OrgCard {...org} />
            </Presence>
          </Box>
        ))}
      </Grid>
      {hasMore && (
        <Center pt={10}>
          <Button
            onClick={loadMore}
            loading={fetcher.state === 'loading'}
            colorPalette="green"
            variant="outline"
          >
            Load more
          </Button>
        </Center>
      )}
    </>
  );
};

export default OrgList;
