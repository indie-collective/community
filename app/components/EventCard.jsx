import React from 'react';
import {
  Box,
  Text,
  AspectRatio,
  Image,
  Heading,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { LuCalendar, LuMapPin } from 'react-icons/lu';

import countryNames from '../assets/countries.json';
import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';
import { formatEventDate, formatEventDay } from '../utils/eventTime';
import Sticker from './Sticker';
import { eventPath } from '../utils/slug';
import { useLanguage } from '../i18n';

const placeOf = (location) =>
  location &&
  (location.city
    ? `${location.city}, ${location.country_code}`
    : countryNames[location.country_code.toUpperCase()]);

/**
 * An event as a ticket stub (magazine pass): the day and month on the stub,
 * a perforation, then the name and place. For the homepage's agenda.
 */
const EventTicket = ({
  id,
  slug,
  name,
  status,
  location,
  startsAt,
  timeZone,
}) => {
  const language = useLanguage();
  const day = formatEventDay(startsAt, timeZone, { locale: language });
  const startsAtText = formatEventDate(startsAt, timeZone, {
    locale: language,
  });
  const canceled = status === 'canceled';
  // The punched holes either side of the perforation, cut in the page colour.
  const hole = {
    content: "''",
    position: 'absolute',
    left: '66px',
    w: '16px',
    h: '16px',
    borderRadius: 'full',
    bg: 'canvas',
  };

  return (
    <Card
      isClickable
      display="grid"
      gridTemplateColumns="74px 1fr"
      bg="surface"
      rounded="xl"
      shadow="lift"
      transition="transform 200ms ease-out"
      _hover={{ transform: 'translateY(-4px) rotate(-0.8deg)' }}
      _before={{ ...hole, top: '-8px' }}
      _after={{ ...hole, bottom: '-8px' }}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        borderRight="2px dashed"
        borderColor="rule"
        py={3}
        aria-hidden
      >
        <Text
          fontFamily="heading"
          fontWeight="800"
          fontSize="3xl"
          lineHeight="1"
          letterSpacing="-0.03em"
          fontVariantNumeric="tabular-nums"
        >
          {day?.day}
        </Text>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="wider"
          textTransform="uppercase"
          color="brandDeep"
        >
          {day?.month}
        </Text>
      </Flex>
      <Box px={4} py={3} minW={0}>
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
          {location && ` · ${placeOf(location)}`}
        </Text>
      </Box>
      {canceled && (
        <Sticker
          tone="coral"
          rotate={3}
          position="absolute"
          top="-10px"
          right={3}
        >
          Canceled
        </Sticker>
      )}
    </Card>
  );
};

function EventCard({
  ref,
  id,
  slug,
  name,
  status,
  cover,
  location,
  game_event,
  event_participant,
  starts_at: startsAt,
  ends_at: endsAt,
  time_zone: timeZone,
  variant,
}) {
  const placeholder = usePlaceholder();
  const language = useLanguage();

  if (variant === 'ticket') {
    return (
      <EventTicket
        {...{ id, slug, name, status, location, startsAt, timeZone }}
      />
    );
  }

  // In the event's own time zone, identical on server and browser (#204).
  const startsAtText = formatEventDate(startsAt, timeZone, {
    locale: language,
  });

  return (
    <Card
      isClickable
      padding={2}
      rounded={10}
      href={eventPath({ id, slug })}
      ref={ref}
    >
      <AspectRatio ratio={2}>
        <Image
          size="100%"
          objectFit="cover"
          src={cover?.thumbnail_url ?? placeholder}
          alt=""
          rounded={5}
          data-card-image
        />
      </AspectRatio>
      <Box padding={2}>
        <Heading
          as="h3"
          size="md"
          title={name}
          textDecoration={status === 'canceled' && 'line-through'}
          color={status === 'canceled' ? 'muted' : undefined}
        >
          <CardLink to={eventPath({ id, slug })}>{name}</CardLink>
        </Heading>

        <Flex
          as={Text}
          title={startsAtText}
          marginTop={1}
          color="muted"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
          align="center"
        >
          <Icon>
            <LuCalendar />
          </Icon>
          <Box asChild lineClamp={1} ml={1}>
            <time dateTime={startsAt && new Date(startsAt).toISOString()}>
              {startsAtText}
            </time>
          </Box>
        </Flex>

        {location && (
          <Flex
            as={Text}
            title={
              location.city
                ? `${location.city}, ${location.country_code}`
                : countryNames[location.country_code.toUpperCase()]
            }
            color="muted"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            align="center"
          >
            <Icon>
              <LuMapPin />
            </Icon>
            <Box as="span" lineClamp={1} flex="1" ml={1}>
              {location.city
                ? `${location.city}, ${location.country_code}`
                : countryNames[location.country_code.toUpperCase()]}
            </Box>
          </Flex>
        )}
      </Box>
    </Card>
  );
}

export default EventCard;
