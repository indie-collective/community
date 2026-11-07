import { Button, Box, Text, Grid, Image, Stack } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import Link from '../components/Link';

import { listEvents, listEventsBetween } from '../data/events.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import EventCard from '../components/EventCard';
import EventDiary from '../components/EventDiary';
import { SubscribeMenu } from '../components/CalendarMenus';
import Filters, { NEAR_RADII } from '../components/Filters';
import { placeAt } from '../utils/mapFocus';
import { monthGridInstants, monthOf, parseMonth } from '../utils/eventCalendar';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import { pageMeta } from '../utils/meta';
import { Page, PageHeader, PageSection } from '../components/Page';
import countryNames from '../assets/countries.json';
import { useT } from '../i18n';

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const period = searchParams.get('period') || 'upcoming';
  // #347: in person or online, and near a place (the visitor's, from the browser).
  const where = ['in_person', 'online'].includes(searchParams.get('where'))
    ? searchParams.get('where')
    : null;
  const near = placeAt(searchParams.get('near'));
  const km = NEAR_RADII.includes(Number(searchParams.get('km')))
    ? Number(searchParams.get('km'))
    : 50;

  // The calendar's month, unless the list is a whole year's.
  const today = new Date().toISOString().slice(0, 10);
  const month = parseMonth(searchParams.get('month'));
  const shownMonth = period === 'upcoming' ? (month ?? monthOf(today)) : null;

  const currentUser = await isAuthenticated(request);

  const [{ events, pastEvents, countries, years }, monthEvents] = await Promise.all([
    listEvents({ country, period, where, near, km }),
    shownMonth
      ? listEventsBetween({ ...monthGridInstants(shownMonth), country, where, near, km })
      : [],
  ]);

  const data = {
    today,
    shownMonth,
    monthEvents,
    events,
    pastEvents, // Only populated if period is upcoming
    facets: {
      countries,
      years,
    },
    selected: {
      country,
      period,
      month,
      where,
      near: near && searchParams.get('near'),
      km,
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
  const { today, shownMonth, monthEvents, events, pastEvents, currentUser, facets, selected } = useLoaderData();
  const t = useT();
  const isPeriodUpcoming = selected.period === 'upcoming';
  const where = [
    selected.where === 'online' ? ' online' : selected.where === 'in_person' ? ' in person' : '',
    selected.country ? ` in ${countryNames[selected.country] ?? selected.country}` : '',
    selected.near ? ` within ${selected.km} km` : '',
  ].join('');

  return (
    <Page>
      <PageHeader
        eyebrow={t('events.diary')}
        title={t('lists.events.title')}
        description={t('lists.events.description')}
        actions={
          <>
            <SubscribeMenu
              calendarPath={selected.country ? `/country/${selected.country.toLowerCase()}/calendar.ics` : '/calendar.ics'}
              feedPath={`/events/feed.xml${selected.country ? `?country=${selected.country}` : ''}`}
            />
            {currentUser && (
              <Button asChild size="sm">
                <Link to="/events/create">
                  <LuPlus />
                  {t('lists.events.add')}
                </Link>
              </Button>
            )}
          </>
        }
      />
      <Filters facets={facets} selected={selected} type="event" />
      {isPeriodUpcoming ? (
        <>
          <EventDiary
            key={`${selected.country}-${selected.where}-${selected.near}`}
            month={shownMonth}
            initialToday={today}
            monthEvents={monthEvents}
            upcoming={events}
            currentUserId={currentUser?.id}
            empty={<NoEvents>No upcoming events{where} yet.</NoEvents>}
          />
          {pastEvents.length > 0 && (
            <PageSection title={t('lists.events.recently')}>
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
