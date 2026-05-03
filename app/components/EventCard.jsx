import React from 'react';
import { useColorModeValue } from './ui/color-mode';
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

function EventCard({
  ref,
  id,
  name,
  status,
  cover,
  location,
  game_event,
  event_participant,
  starts_at: startsAt,
  ends_at: endsAt,
}) {
  const placeholder = usePlaceholder();

  const startsAtText = new Date(startsAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <Card
      isClickable
      padding={2}
      rounded={10}
      href={`/event/${id}`}
      ref={ref}
      transition="background-color 200ms ease-out"
      cursor="pointer"
      _hover={{
        bg: { base: 'gray.200', _dark: 'gray.700' },
      }}
    >
      <AspectRatio ratio={2}>
        <Image
          size="100%"
          objectFit="cover"
          src={cover?.thumbnail_url ?? placeholder}
          alt="Event cover"
          rounded={5}
        />
      </AspectRatio>
      <Box padding={2}>
        <Heading
          as="h3"
          size="lg"
          title={name}
          textDecoration={status === 'canceled' && 'line-through'}
          color={status === 'canceled' && 'gray.500'}
        >
          <CardLink to={`/event/${id}`}>{name}</CardLink>
        </Heading>

        <Flex
          as={Text}
          title={startsAtText}
          marginTop={1}
          color="gray.500"
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
            <time dateTime={startsAt}>{startsAtText}</time>
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
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            align="center"
          >
            <Icon>
              <LuMapPin />
            </Icon>
            <Box lineClamp={1} flex="1" ml={1}>
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
