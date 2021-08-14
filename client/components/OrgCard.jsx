import { gql } from '@apollo/client';
import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Badge,
  Image,
  Flex,
  Heading,
  DarkMode,
  IconButton,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';

const TYPES_ABBR = {
  STUDIO: 'studio',
  ASSOCIATION: 'asso.',
};

const TYPES_COLORS = {
  STUDIO: 'yellow',
  ASSOCIATION: 'green',
};

export const OrgCardSkeleton = () => (
  <Flex position="relative" alignItems="center">
    <Flex
      direction="column"
      width="75px"
      mr={3}
      flexShrink={0}
      position="relative"
    >
      <Skeleton w="75px" h="75px" />
    </Flex>

    <Box flex="1">
      <SkeletonText skeletonHeight="1.8rem" py={2} noOfLines={1} w="75%" />

      <SkeletonText skeletonHeight="0.75rem" noOfLines={1} w="50%" />
    </Box>
  </Flex>
);

const OrgCard = ({ id, type, logo, name, people, games, events, onRemove }) => {
  const placeholder = usePlaceholder('square');

  const bg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Card
      isClickable
      transition="background-color 200ms ease-out"
      _hover={{
        backgroundColor: bg,
        cursor: 'pointer',
      }}
      rounded={5}
    >
      <Flex position="relative" alignItems="center">
        <Flex
          direction="column"
          width="75px"
          mr={3}
          flexShrink={0}
          position="relative"
        >
          <Image
            w="75px"
            h="75px"
            objectFit="contain"
            src={logo && logo.thumbnail_url}
            alt="Organization cover"
            fallbackSrc={placeholder}
            rounded={3}
          />

          <DarkMode>
            <Badge
              position="absolute"
              bottom={0}
              textAlign="center"
              width="100%"
              rounded={3}
              variant="solid"
              colorScheme={TYPES_COLORS[type]}
              fontSize="0.55em"
            >
              {TYPES_ABBR[type]}
            </Badge>
          </DarkMode>
        </Flex>

        <Box isTruncated flex="1">
          <Heading as="h3" size="md" isTruncated>
            <NextLink href={`/org/${id}`}>
              <CardLink href={`/org/${id}`}>{name}</CardLink>
            </NextLink>
          </Heading>

          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
          >
            {type === 'STUDIO' &&
              `${games.totalCount} ${
                games.totalCount === 1 ? 'game' : 'games'
              }`}
            {type !== 'STUDIO' &&
              `${events.totalCount} ${
                events.totalCount === 1 ? 'event' : 'events'
              }`}
          </Box>
        </Box>

        {onRemove && (
          <IconButton
            mx={5}
            size="xs"
            aria-label={`Remove ${name}`}
            isRound
            colorScheme="red"
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.preventDefault();

              onRemove();
            }}
          />
        )}
      </Flex>
    </Card>
  );
};

OrgCard.fragments = {
  org: gql`
    fragment OrgCardOrg on Entity {
      id
      name
      type
      logo {
        thumbnail_url
      }
      people {
        totalCount
      }
      games {
        totalCount
      }
      events {
        totalCount
      }
    }
  `,
};

export default OrgCard;
