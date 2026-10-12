import {
  Box,
  Button,
  Grid,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import Link from '../components/Link';

import { listEvents } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import EventCard from '../components/EventCard';
import Filters from '../components/Filters';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';
import { Page, PageHeader, PageSection } from '../components/Page';
import { Row, RowList } from '../components/kit/RowList';
import BarList from '../components/kit/BarList';
import DateBadge from '../components/kit/DateBadge';
import CountryCode from '../components/kit/CountryCode';
import { eventPath } from '../utils/slug';
import countryNames from '../assets/countries.json';

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const period = searchParams.get('period') || 'upcoming';

  const currentUser = await isAuthenticated(request);

  const { events, pastEvents, countries, years } = await listEvents({
    country,
    period,
  });

  const data = {
    events,
    pastEvents, // Only populated if period is upcoming
    facets: {
      countries,
      years,
    },
    selected: {
      country,
      period,
    },
    currentUser,
  };
  return data;
};

export const meta = ({ matches, location }) =>
  pageMeta(matches, {
    title: 'Events',
    description:
      'Indie game events around you and around the world: festivals, conventions, meetups and game jams.',
    path: location.pathname,
  });

// One grid for every list of events (#311: upcoming ones were in a carousel
// that rendered nothing).
const EventGrid = ({ events }) => (
  <Grid gap={4} templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
    {events.map((event) => (
      <Box minW={0} key={event.id}>
        <EventCard {...event} />
      </Box>
    ))}
  </Grid>
);

const NoEvents = ({ children }) => (
  <Stack align="center" textAlign="center" py={10} gap={5}>
    <Image src={noEventsImage} alt="" maxW="200px" />
    <Text fontSize="lg" color="muted">
      {children}
    </Text>
  </Stack>
);

const Events = () => {
  const { events, pastEvents, currentUser, facets, selected } = useLoaderData();
  const isPeriodUpcoming = selected.period === 'upcoming';
  const where = selected.country
    ? ` in ${countryNames[selected.country] ?? selected.country}`
    : '';

  return (
    <Page>
      <PageHeader
        title="Events"
        description="Festivals, conventions, meetups and game jams where indie games are made and shown."
        actions={
          currentUser && (
            <Button asChild size="sm">
              <Link to="/events/create">
                <LuPlus />
                Add an event
              </Link>
            </Button>
          )
        }
      />
      <Filters facets={facets} selected={selected} type="event" />
      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 280px' }}
        gap={8}
        alignItems="start"
      >
        <Box minW={0}>
          {isPeriodUpcoming ? (
            <>
              <PageSection title="Upcoming">
                {events.length > 0 ? (
                  <EventGrid events={events} />
                ) : (
                  <NoEvents>No upcoming events{where} yet.</NoEvents>
                )}
              </PageSection>
              {pastEvents.length > 0 && (
                <PageSection title="Recently">
                  <RowList>
                    {pastEvents.map((event) => (
                      <Row
                        key={event.id}
                        to={eventPath(event)}
                        start={
                          <DateBadge
                            value={event.starts_at}
                            timeZone={event.time_zone}
                          />
                        }
                        title={event.name}
                        sub={[
                          event.location?.city,
                          new Date(event.starts_at).getUTCFullYear(),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        end={
                          <CountryCode code={event.location?.country_code} />
                        }
                      />
                    ))}
                  </RowList>
                </PageSection>
              )}
            </>
          ) : events.length > 0 ? (
            <EventGrid events={events} />
          ) : (
            <NoEvents>
              No events{where} in {selected.period}.
            </NoEvents>
          )}
        </Box>
        {/* How many events each year (design pass): the gaps show what's missing. */}
        <PageSection title="Events per year" mb={0}>
          <Box bg="surface" borderRadius="xl" shadow="xs" p={4}>
            <BarList
              aria-label="Events per year"
              labelWidth="3em"
              rows={facets.years.slice(0, 8).map(({ year, count }) => ({
                key: year,
                to: `/events?period=${year}`,
                label: year,
                parts: [{ value: count, color: 'kind.event' }],
              }))}
            />
            <Text fontSize="xs" color="muted" mt={3}>
              Know one that's missing?{' '}
              <ChakraLink asChild textDecoration="underline">
                <Link to="/events/create">Add an event</Link>
              </ChakraLink>
            </Text>
          </Box>
        </PageSection>
      </Grid>
    </Page>
  );
};

export default Events;
