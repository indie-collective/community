import React, { forwardRef } from 'react';
import {
  Box,
  Text,
  AspectRatio,
  Image,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';

import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';
import { DateIcon } from './DateIcon';
import { LocationIcon } from './LocationIcon';

const EventCard = forwardRef(
  (
    {
      id,
      name,
      status,
      cover,
      location,
      game_event,
      event_participant,
      starts_at: startsAt,
      ends_at: endsAt,
    },
    ref
  ) => {
    const placeholder = usePlaceholder();

    const bg = useColorModeValue('gray.100', 'gray.700');

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
        _hover={{
          backgroundColor: bg,
          cursor: 'pointer',
        }}
      >
        <AspectRatio ratio={2}>
          <Image
            size="100%"
            objectFit="cover"
            src={cover && cover.thumbnail_url}
            alt="Event cover"
            fallbackSrc={placeholder}
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

          <Box
            marginTop={1}
            noOfLines={1}
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            <DateIcon width="16px" />{' '}
            <Text
              as="time"
              dateTime={startsAt}
              title={startsAtText}
              verticalAlign="middle"
            >
              {startsAtText}
            </Text>
          </Box>

          {location && (
            <Box
              noOfLines={1}
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
            >
              <LocationIcon width="16px" />{' '}
              <Text as="span" verticalAlign="middle">
                {location.city}, {location.country_code}
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    );
  }
);

export default EventCard;
