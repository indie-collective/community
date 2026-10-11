import { Button, Box, Text, Grid, Image, Stack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { Link, useLoaderData } from 'react-router';

import { listEvents } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import EventCard from '../components/EventCard';
import Filters from '../components/Filters';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';
import { Page, PageHeader, PageSection } from '../components/Page';
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
              <EventGrid events={pastEvents} />
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
    </Page>
  );
};

export default Events;
