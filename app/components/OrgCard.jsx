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
  NativeSelect,
} from '@chakra-ui/react';
import { LuMapPin, LuTrash2 } from 'react-icons/lu';

import usePlaceholder from '../hooks/usePlaceholder';
import countryNames from '../assets/countries.json';
import Card from './Card';
import CardLink from './CardLink';
import {
  ORG_STATUSES,
  orgStatusLabel,
  orgTypeColor,
  orgTypeLabel,
} from '../utils/orgTypes';
import { GAME_ROLES, gameRoleLabel } from '../utils/gameRoles';
import { orgPath } from '../utils/slug';

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
  slug,
  type,
  status,
  logo,
  name,
  location,
  people,
  games,
  events,
  onRemove,
  // #40: how the organisation took part in a game, shown under its name;
  // with onInvolvementChange, a select to change it.
  involvement,
  onInvolvementChange,
  // Roles it already has on the game, not offered in the select (#335).
  takenRoles = [],
  // #331: on the publishers list, how many games it published.
  published_count,
  ...rest
}) => {
  const placeholder = usePlaceholder('square');

  return (
    <Card id={id} isClickable padding={2} rounded={10} {...rest}>
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
            alt=""
            rounded={3}
            data-card-image
          />

          <DarkMode>
            <Badge
              position="absolute"
              bottom="3px"
              right="3px"
              rounded={3}
              variant="solid"
              colorPalette={orgTypeColor(type)}
              fontSize="0.55em"
            >
              {orgTypeLabel(type, { short: true })}
            </Badge>
          </DarkMode>
        </Flex>

        <Box flex="1">
          <Heading as="h3" size="md" title={name}>
            <CardLink to={orgPath({ id, slug })}>{name}</CardLink>
          </Heading>

          {status && status !== 'active' && (
            <Badge size="sm" colorPalette={ORG_STATUSES[status]?.color}>
              {orgStatusLabel(status)}
            </Badge>
          )}

          {involvement &&
            (onInvolvementChange ? (
              // Above the card's link overlay, so it can be used.
              <NativeSelect.Root
                size="xs"
                width="9rem"
                my={1}
                position="relative"
                zIndex={1}
              >
                <NativeSelect.Field
                  aria-label={`Role of ${name}`}
                  value={involvement}
                  onChange={(event) => onInvolvementChange(event.target.value)}
                >
                  {GAME_ROLES.map(([value, label]) => (
                    <option key={value} value={value} disabled={takenRoles.includes(value)}>
                      {label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            ) : (
              <Text fontSize="sm" color="muted">
                {gameRoleLabel(involvement)}
              </Text>
            ))}

          {published_count > 0 && (
            <Text fontSize="sm" color="muted">
              Published {published_count} {published_count === 1 ? 'game' : 'games'}
            </Text>
          )}

          {location && (
            <Flex
              as={Text}
              title={
                location.city
                  ? `${location.city}, ${location.country_code}`
                  : countryNames[location.country_code.toUpperCase()]
              }
              color="muted"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              align="center"
            >
              <Icon>
                <LuMapPin />
              </Icon>
              <Box as="span" lineClamp={1} flex="1" ml={1}>
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
