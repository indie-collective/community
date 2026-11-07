import { Box, Flex, Grid, Heading, Image, Text } from '@chakra-ui/react';

import countryNames from '../assets/countries.json';
import Card from './Card';
import CardLink from './CardLink';
import {
  formatEventDate,
  formatEventDay,
  formatEventRange,
} from '../utils/eventTime';
import { eventDays } from '../utils/eventCalendar';
import Label from './Label';
import { eventPath } from '../utils/slug';
import { useLanguage, useT } from '../i18n';

// Its venue first (#390), then where that is.
const placeOf = (location, venue) =>
  location &&
  [
    venue?.name,
    location.city
      ? `${location.city}, ${location.country_code}`
      : countryNames[location.country_code?.toUpperCase()],
  ]
    .filter(Boolean)
    .join(' · ');

// The holes of a ticket's perforation, cut out of it with a mask (painted
// circles showed over its shadow). `at` lists their centres.
const notches = (at) => {
  const masks = at
    .map((pos) => `radial-gradient(circle 8px at ${pos}, transparent 7.5px, #000 8px)`)
    .join(', ');
  return {
    maskImage: masks,
    WebkitMaskImage: masks,
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  };
};

const STUB = 74;
const STRIP = 124;

/**
 * The date as a calendar page: the month on a green bar, the day below.
 * The event page's tile over its picture, and every ticket's stub.
 */
export const CalendarDate = ({ value, timeZone, size = 'md', ...rest }) => {
  const language = useLanguage();
  const day = formatEventDay(value, timeZone, { locale: language });
  const big = size === 'lg';
  return (
    <Flex direction="column" textAlign="center" aria-hidden {...rest}>
      <Text
        bg="primary.solid"
        color="primary.contrast"
        fontWeight="semibold"
        fontSize={big ? 'sm' : 'xs'}
        py={big ? 1 : 0.5}
      >
        {day?.month ?? '—'}
      </Text>
      <Flex flex="1" align="center" justify="center" py={big ? 2 : 1.5}>
        <Text
          fontFamily="heading"
          fontWeight="600"
          fontSize={big ? '4xl' : '3xl'}
          lineHeight="1"
          letterSpacing="-0.03em"
          fontVariantNumeric="tabular-nums"
        >
          {day?.day}
        </Text>
      </Flex>
    </Flex>
  );
};

/**
 * An event as a ticket, everywhere events are listed. The stub is a
 * calendar page, or the event's picture in a list; in a grid the picture is
 * a strip on top, torn along a perforation. Then the name, when and where.
 */
function EventCard({
  id,
  slug,
  name,
  status,
  cover,
  location,
  venue,
  starts_at: startsAt,
  ends_at: endsAt,
  time_zone: timeZone,
  attendance,
  going,
  layout = 'list',
}) {
  const language = useLanguage();
  const t = useT();
  const days =
    endsAt &&
    eventDays({ starts_at: startsAt, ends_at: endsAt, time_zone: timeZone });
  // Several days read as a range, one as its day and time; in the event's
  // own time zone, identical on server and browser (#204).
  const startsAtText =
    days && days.first !== days.last
      ? formatEventRange(startsAt, endsAt, timeZone, {
          locale: language,
          time: false,
        })
      : formatEventDate(startsAt, timeZone, { locale: language });
  const canceled = status === 'canceled';
  const online = attendance === 'online' || attendance === 'hybrid';
  const picture = cover?.thumbnail_url;
  const strip = layout === 'grid' && picture;

  const stub = (
    <Box borderRight="2px dashed" borderColor="rule" minH={`${STUB}px`} display="flex">
      {picture && !strip ? (
        <Image src={picture} alt="" w="100%" h="100%" objectFit="cover" data-card-image />
      ) : (
        <CalendarDate value={startsAt} timeZone={timeZone} flex="1" />
      )}
    </Box>
  );

  const body = (
    <Box px={4} py={3} minW={0} alignSelf="center">
      <Heading
        as="h3"
        size="md"
        title={name}
        lineHeight="1.2"
        textDecoration={canceled ? 'line-through' : undefined}
        color={canceled ? 'muted' : undefined}
      >
        <CardLink to={eventPath({ id, slug })}>{name}</CardLink>
      </Heading>
      <Text fontSize="sm" color="muted" mt={1} lineClamp={1}>
        <time dateTime={startsAt && new Date(startsAt).toISOString()}>
          {startsAtText}
        </time>
        {location && ` · ${placeOf(location, venue)}`}
      </Text>
      {(online || going) && (
        <Flex gap={1.5} mt={2} wrap="wrap">
          {going && <Label tone="sun">{t('events.going')}</Label>}
          {online && (
            <Label tone="lilac">
              {t(attendance === 'hybrid' ? 'events.hybrid' : 'events.online')}
            </Label>
          )}
        </Flex>
      )}
    </Box>
  );

  return (
    // The shadow is a drop shadow on this wrapper, so it follows the
    // notches; the wrapper also carries the hover tilt and the focus ring.
    <Box
      position="relative"
      filter="drop-shadow(0 1px 1px rgba(16, 32, 29, 0.08)) drop-shadow(0 8px 14px rgba(16, 32, 29, 0.12))"
      transition="transform 200ms ease-out"
      _hover={{ transform: 'translateY(-4px) rotate(-0.8deg)' }}
      _focusWithin={{ outline: '2px solid', outlineColor: 'brand', outlineOffset: '3px', rounded: 'card' }}
    >
      <Card
        isClickable
        bg="surface"
        rounded="card"
        overflow="hidden"
        _hover={{}}
        _active={{}}
        _focusWithin={{}}
        css={notches(
          strip
            ? [`0 ${STRIP}px`, `100% ${STRIP}px`]
            : [`${STUB}px 0`, `${STUB}px 100%`]
        )}
      >
        {strip && (
          <Image
            src={picture}
            alt=""
            w="100%"
            h={`${STRIP}px`}
            objectFit="cover"
            borderBottom="2px dashed"
            borderColor="rule"
            data-card-image
          />
        )}
        <Grid templateColumns={`${STUB}px 1fr`}>
          {stub}
          {body}
        </Grid>
      </Card>
      {canceled && (
        <Label tone="coral" position="absolute" top="-10px" right={3}>
          {t('events.canceled')}
        </Label>
      )}
    </Box>
  );
}

export default EventCard;
