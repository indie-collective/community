import React, { forwardRef } from 'react';
import {
  Box,
  Text,
  AspectRatio,
  Image,
  Heading,
} from '@chakra-ui/react';

import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';

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

    const bg = 'gray.100';

    const startsAtText = new Date(startsAt).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
    });

    return (
      <Card
        isClickable
        href={`/event/${id}`}
        ref={ref}
        transition="background-color 200ms ease-out"
        _hover={{
          backgroundColor: bg,
          cursor: 'pointer',
        }}
        rounded={5}
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
          <Text
            textTransform="uppercase"
            noOfLines={1}
            color={status === 'canceled' && 'gray.500'}
          >
            <Text as="time" dateTime={startsAt} title={startsAtText}>
              {startsAtText}
            </Text>
            {location && (
              <>
                {' '}
                •{' '}
                <Text title={location.city} as="span">
                  {location.city}
                </Text>
              </>
            )}
          </Text>

          <Heading
            as="h3"
            size="lg"
            noOfLines={1}
            title={name}
            textDecoration={status === 'canceled' && 'line-through'}
            color={status === 'canceled' && 'gray.500'}
          >
            <CardLink to={`/event/${id}`}>{name}</CardLink>
          </Heading>

          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            {game_event.length} games
            {event_participant.length > 0 && (
              <>
                {' '}
                &bull; {event_participant.length}{' '}
                {status !== 'canceled' &&
                  (new Date(endsAt) < new Date() ? 'went' : 'going')}
                {status === 'canceled' && 'were going'}
              </>
            )}
          </Box>
        </Box>
      </Card>
    );
  }
);

export default EventCard;
