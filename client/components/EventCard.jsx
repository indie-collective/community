import { gql } from '@apollo/client';
import React, { forwardRef } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Text,
  AspectRatio,
  Image,
  Heading,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';

import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';

export const EventCardSkeleton = () => (
  <Box>
    <AspectRatio ratio={2}>
      <Skeleton />
    </AspectRatio>
    <Box py={2}>
      <SkeletonText skeletonHeight="1rem" noOfLines={1} w="60%" />
      <SkeletonText skeletonHeight="1.8rem" py={2} noOfLines={1} w="75%" />
      <SkeletonText skeletonHeight="0.75rem" noOfLines={1} w="50%" />
    </Box>
  </Box>
);

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
      startsAt,
      endsAt,
    },
    ref
  ) => {
    const placeholder = usePlaceholder();

    const bg = useColorModeValue('gray.100', 'gray.700');

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
            whiteSpace="nowrap"
            isTruncated
            color={status === 'CANCELED' && 'gray.500'}
          >
            <Text as="time" dateTime={startsAt}>
              {new Date(startsAt).toLocaleString(undefined, {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
            {location && (
              <>
                {' '}
                • <Text as="span">{location.city}</Text>
              </>
            )}
          </Text>

          <Heading
            as="h3"
            size="lg"
            isTruncated
            textDecoration={status === 'CANCELED' && 'line-through'}
            color={status === 'CANCELED' && 'gray.500'}
          >
            <NextLink href={`/event/${id}`}>
              <CardLink href={`/event/${id}`}>{name}</CardLink>
            </NextLink>
          </Heading>

          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            {games.totalCount} games
            {participants.totalCount > 0 && (
              <>
                {' '}
                &bull; {participants.totalCount}{' '}
                {status !== 'CANCELED' &&
                  (new Date(endsAt) < new Date() ? 'went' : 'going')}
                {status === 'CANCELED' && 'were going'}
              </>
            )}
          </Box>
        </Box>
      </Card>
    );
  }
);

EventCard.fragments = {
  event: gql`
    fragment EventCardEvent on Event {
      id
      name
      status
      startsAt
      endsAt

      cover {
        thumbnail_url
      }
      location {
        id
        countryCode
        city
        latitude
        longitude
      }
      participants {
        totalCount
      }
      games {
        totalCount
      }
    }
  `,
};

export default EventCard;
