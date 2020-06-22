import gql from 'graphql-tag';
import React, { forwardRef } from 'react';
import Link from 'next/link';
import {
  Box,
  Text,
  AspectRatioBox,
  Image,
  Heading,
  PseudoBox,
  useColorMode,
} from '@chakra-ui/core';
import usePlaceholder from '../hooks/usePlaceholder';

const EventCard = forwardRef(
  (
    { id, name, cover, location, games, participants, startsAt, endsAt },
    ref
  ) => {
    const { colorMode } = useColorMode();
    const placeholder = usePlaceholder();

    return (
      <Link href="/event/[id]" as={`/event/${id}`}>
        <a>
          <PseudoBox
            ref={ref}
            transition="background-color 200ms ease-out"
            _hover={{
              backgroundColor: colorMode === 'dark' ? 'gray.700' : 'gray.50',
              cursor: 'pointer',
            }}
            rounded={5}
          >
            <AspectRatioBox ratio={2}>
              <Image
                size="100%"
                objectFit="cover"
                src={cover && cover.thumbnail_url}
                alt="Event cover"
                fallbackSrc={placeholder}
                rounded={5}
              />
            </AspectRatioBox>

            <Box padding={2}>
              <Text textTransform="uppercase" whiteSpace="nowrap" isTruncated>
                <Text as="time" datetime={startsAt}>
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

              <Heading as="h3" size="lg" lineHeight="tight" isTruncated>
                {name}
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
                    {new Date(endsAt) < new Date() ? 'went' : 'going'}
                  </>
                )}
              </Box>
            </Box>
          </PseudoBox>
        </a>
      </Link>
    );
  }
);

EventCard.fragments = {
  event: gql`
    fragment EventCardEvent on Event {
      id
      name
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
