import { Box, Grid, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { LuExternalLink, LuMapPin } from 'react-icons/lu';
import { useLoaderData } from 'react-router';

import countryNames from '../assets/countries.json';
import ActionMenu from '../components/ActionMenu';
import EmptyHint from '../components/EmptyHint';
import EventCard from '../components/EventCard';
import Link from '../components/Link';
import Markdown from '../components/Markdown';
import { Page, PageHeader, PageSection } from '../components/Page';
import PlaceMap from '../components/PlaceMap';
import { listVenueEvents } from '../data/events.server';
import { getVenue } from '../data/venues.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { pageMeta, summarize } from '../utils/meta';
import { pinColor } from '../utils/orgTypes';
import { pageRecordId } from '../utils/pageRecord.server';
import { venuePath } from '../utils/slug';

export const loader = async ({ request, params }) => {
  // By slug, an old slug or UUID; those redirect to the slug (#209).
  const id = await pageRecordId('venue', request, params.id);
  const [venue, events, currentUser] = await Promise.all([
    getVenue(id),
    listVenueEvents(id),
    isAuthenticated(request),
  ]);
  if (!venue) throw new Response('Not Found', { status: 404 });
  return { venue, events, currentUser };
};

const placeOf = (location) =>
  [location?.city, countryNames[location?.country_code] ?? location?.country_code].filter(Boolean).join(', ');

export const meta = ({ data, matches }) => {
  if (!data?.venue) return [{ title: 'Venue not found!' }];
  const { venue } = data;
  const place = placeOf(venue.location);
  return pageMeta(matches, {
    title: `${venue.name} | Venues`,
    shareTitle: venue.name,
    description: summarize(venue.about) || `Indie game events at ${venue.name}${place ? `, ${place}` : ''}`,
    path: venuePath(venue),
  });
};

const Events = ({ events }) => (
  <Grid as="ul" listStyleType="none" gap={3} templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
    {events.map((event) => (
      <Box as="li" minW={0} key={event.id}>
        <EventCard {...event} />
      </Box>
    ))}
  </Grid>
);

const Venue = () => {
  const { venue, events, currentUser } = useLoaderData();
  const { id, name, about, site, location } = venue;
  const place = placeOf(location);
  const address = [location?.street, location?.city].filter(Boolean).join(', ');
  return (
    <Page>
      <PageHeader
        eyebrow={['Venue', place].filter(Boolean).join(' · ')}
        title={name}
        actions={currentUser && <ActionMenu editLink={`/venue/${id}/edit`} />}
      >
        <Stack gap={1} color="muted">
          {location && (
            <Text display="flex" alignItems="flex-start" gap={2}>
              <Box as="span" mt="3px">
                <LuMapPin />
              </Box>
              <span>
                {[location.street, location.city, location.region].filter(Boolean).join(', ')}
                {location.country_code && (
                  <>
                    {(location.street || location.city || location.region) && ', '}
                    <ChakraLink asChild>
                      <Link to={`/country/${location.country_code.toLowerCase()}`}>
                        {countryNames[location.country_code] ?? location.country_code}
                      </Link>
                    </ChakraLink>
                  </>
                )}
              </span>
            </Text>
          )}
          {site && (
            <ChakraLink href={site} target="_blank" rel="noopener noreferrer">
              Website
              <LuExternalLink />
            </ChakraLink>
          )}
        </Stack>
      </PageHeader>

      {location?.latitude != null && location?.longitude != null && (
        <PlaceMap location={location} id={id} color={pinColor('event')} label={name} address={address} />
      )}

      {about && (
        <PageSection title="About" maxW="2xl">
          <Markdown value={about} />
        </PageSection>
      )}

      <PageSection title="Upcoming events">
        {events.upcoming.length > 0 ? (
          <Events events={events.upcoming} />
        ) : (
          <EmptyHint>Nothing planned here for now.</EmptyHint>
        )}
      </PageSection>

      {events.past.length > 0 && (
        <PageSection title="Past events">
          <Events events={events.past} />
        </PageSection>
      )}
    </Page>
  );
};

export default Venue;
