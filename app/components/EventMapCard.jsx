import { Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import React from 'react';

import usePlaceholder from '../hooks/usePlaceholder';
import { formatEventRange } from '../utils/eventTime';
import Card from './Card';
import CardLink from './CardLink';
import { eventPath } from '../utils/slug';
import { useLanguage } from '../i18n';

/**
 * An upcoming event in the map's list (#211), the height of an OrgCard: its
 * cover, name, dates (in its own time zone) and city.
 */
// eslint-disable-next-line no-unused-vars -- `type` and `logo` are the map's, not the card's.
const EventMapCard = ({ id, slug, name, cover, starts_at, ends_at, time_zone, location, type, logo, ...rest }) => {
  const language = useLanguage();
  const placeholder = usePlaceholder('square');
  return (
    <Card
      id={id}
      isClickable
      padding={2}
      rounded={10}
      transition="background-color 200ms ease-out"
      cursor="pointer"
      _hover={{ bg: { base: 'gray.200', _dark: 'gray.700' } }}
      {...rest}
    >
      <Flex alignItems="center">
        <Image
          w="75px"
          h="75px"
          mr={3}
          flexShrink={0}
          objectFit="cover"
          src={cover?.thumbnail_url ?? placeholder}
          alt=""
          rounded={3}
        />
        <Box flex="1" minW={0}>
          {/* One line: the dates and city fill the rest of the row. */}
          <Heading as="h3" size="md" title={name} truncate>
            <CardLink to={eventPath({ id, slug })}>{name}</CardLink>
          </Heading>
          <Text fontSize="sm" color="purple.500" fontWeight="semibold" truncate>
            {formatEventRange(starts_at, ends_at, time_zone, { time: false, locale: language })}
          </Text>
          {location?.city && (
            <Text fontSize="xs" color="muted" textTransform="uppercase" lineClamp={1}>
              {location.city}, {location.country_code}
            </Text>
          )}
        </Box>
      </Flex>
    </Card>
  );
};

export default EventMapCard;
