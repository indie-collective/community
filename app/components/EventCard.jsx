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
import { formatEventDate } from '../utils/eventTime';
import { eventPath } from '../utils/slug';

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
}) {
  const placeholder = usePlaceholder();

  // In the event's own time zone, identical on server and browser (#204).
  const startsAtText = formatEventDate(startsAt, timeZone);

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
