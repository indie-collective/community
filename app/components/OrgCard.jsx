import React from 'react';
import {
  Box,
  Badge,
  Image,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';

import usePlaceholder from '../hooks/usePlaceholder';
import countryNames from '../assets/countries.json';
import { LocationIcon } from './LocationIcon';
import Card from './Card';
import CardLink from './CardLink';

const TYPES_ABBR = {
  studio: 'studio',
  association: 'asso.',
};

const TYPES_COLORS = {
  studio: 'yellow',
  association: 'green',
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

const OrgCard = ({
  id,
  type,
  logo,
  name,
  location,
  people,
  games,
  events,
  onRemove,
  ...rest
}) => {
  const placeholder = usePlaceholder('square');

  const bg = 'gray.100';

  return (
    <Card
      id={id}
      isClickable
      padding={2}
      rounded={10}
      transition="background-color 200ms ease-out"
      _hover={{
        backgroundColor: bg,
        cursor: 'pointer',
      }}
      {...rest}
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
        </Flex>

        <Box flex="1">
          <Heading as="h3" size="md" noOfLines={2} wordBreak="break-word" title={name}>
            <CardLink to={`/org/${id}`}>{name}</CardLink>
          </Heading>

          {location && (
            <Box
              noOfLines={1}
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
            >
              <LocationIcon />{' '}
              {location.city
                ? `${location.city}, ${location.country_code}`
                : countryNames[location.country_code.toUpperCase()]}
            </Box>
          )}
        </Box>

        {onRemove && (
          <IconButton
            mx={5}
            size="xs"
            aria-label={`Remove ${name}`}
            borderRadius="full"
            colorScheme="red"
            icon={<FiTrash2 />}
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

export default OrgCard;
