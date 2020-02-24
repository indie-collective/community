import React from 'react';
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

const EventCard = ({
  id,
  name,
  cover,
  location,
  games,
  entities,
  startsAt,
  onClick,
}) => {
  const { colorMode } = useColorMode();

  return (
    <PseudoBox
      onClick={onClick}
      _hover={{
        backgroundColor: colorMode === 'dark' ? 'gray.700' : 'gray.50',
        cursor: 'pointer',
      }}
      rounded={5}
    >
      <AspectRatioBox ratio={3}>
        <Image
          size="100%"
          objectFit="cover"
          src={cover && cover.thumbnail_url}
          alt="Event cover"
          fallbackSrc="https://via.placeholder.com/800x300?text=Event cover"
          roundedTop={5}
        />
      </AspectRatioBox>

      <Box borderWidth="1px" roundedBottom={5} padding={2}>
        <Text textTransform="uppercase" whiteSpace="nowrap">
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
          <Link href="/event/[id]" as={`/event/${id}`}>
            <a>{name}</a>
          </Link>
        </Heading>

        <Box
          color="gray.500"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
        >
          {games.totalCount} games &bull; {entities.totalCount} orgs
        </Box>
      </Box>
    </PseudoBox>
  );
};

export default EventCard;
