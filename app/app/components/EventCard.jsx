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

const EventCard = forwardRef(
  (
    {
      id,
      name,
      status,
      cover,
      location,
      games,
      participants,
      start: startsAt,
      end: endsAt,
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
            {games.length} games
            {participants.length > 0 && (
              <>
                {' '}
                &bull; {participants.length}{' '}
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
