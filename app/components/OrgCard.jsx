import React from 'react';
import { DarkMode } from './ui/color-mode';
import {
  Box,
  Badge,
  Image,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  SkeletonText,
  Text,
  Icon,
} from '@chakra-ui/react';
import { LuMapPin, LuTrash2 } from 'react-icons/lu';

import usePlaceholder from '../hooks/usePlaceholder';
import countryNames from '../assets/countries.json';
import Card from './Card';
import CardLink from './CardLink';

const TYPES_ABBR = {
  studio: 'studio',
  association: 'assoc',
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
      <SkeletonText skeletonHeight="1.8rem" py={2} lineClamp={1} w="75%" />

      <SkeletonText skeletonHeight="0.75rem" lineClamp={1} w="50%" />
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

  return (
    <Card
      id={id}
      isClickable
      padding={2}
      rounded={10}
      transition="background-color 200ms ease-out"
      cursor="pointer"
      _hover={{
        bg: { base: 'gray.200', _dark: 'gray.700' },
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
            src={logo?.thumbnail_url ?? placeholder}
            alt="Organization cover"
            rounded={3}
          />

          <DarkMode>
            <Badge
              position="absolute"
              bottom="3px"
              right="3px"
              rounded={3}
              variant="solid"
              colorPalette={TYPES_COLORS[type]}
              fontSize="0.55em"
            >
              {TYPES_ABBR[type]}
            </Badge>
          </DarkMode>
        </Flex>

        <Box flex="1">
          <Heading as="h3" size="md" title={name}>
            <CardLink to={`/org/${id}`}>{name}</CardLink>
          </Heading>

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

        {onRemove && (
          <IconButton
            mx={5}
            size="xs"
            aria-label={`Remove ${name}`}
            rounded="full"
            colorPalette="red"
            onClick={(e) => {
              e.preventDefault();

              onRemove();
            }}
          >
            <LuTrash2 />
          </IconButton>
        )}
      </Flex>
    </Card>
  );
};

export default OrgCard;
