import React from 'react';
import {
  Box,
  Image,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  SkeletonText,
  Text,
  NativeSelect,
} from '@chakra-ui/react';
import { LuTrash2 } from 'react-icons/lu';

import usePlaceholder from '../hooks/usePlaceholder';
import countryNames from '../assets/countries.json';
import Card from './Card';
import CardLink from './CardLink';
import Label from './Label';
import { orgStatusLabel, orgTypeLabel } from '../utils/orgTypes';
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
  // Magazine pass: 'badge' is the homepage masthead's round logo, ringed in
  // its type's colour, with the name and type and city under it.
  variant,
  ...rest
}) => {
  const placeholder = usePlaceholder('square');

  if (variant === 'badge') {
    return (
      <Card isClickable textAlign="center" rounded="card" p={2} {...rest}>
        <Box
          mx="auto"
          w="100%"
          maxW="110px"
          aspectRatio={1}
          rounded="full"
          overflow="hidden"
          borderWidth="2px"
          borderColor="rule"
          bg="surface"
          transition="transform 300ms cubic-bezier(0.3, 1.6, 0.5, 1)"
          css={{
            '[data-card]:hover &': { transform: 'rotate(-10deg) scale(1.06)' },
          }}
        >
          <Image
            w="100%"
            h="100%"
            objectFit="contain"
            src={logo?.thumbnail_url ?? placeholder}
            alt=""
            data-card-image
          />
        </Box>
        <Heading as="h3" size="sm" mt={2} lineHeight="1.2" title={name}>
          <CardLink to={orgPath({ id, slug })}>{name}</CardLink>
        </Heading>
        <Text fontSize="xs" color="muted" lineClamp={1}>
          {orgTypeLabel(type)}
          {location?.city && ` · ${location.city}`}
        </Text>
      </Card>
    );
  }

  return (
    <Card id={id} isClickable padding={2} rounded="card" {...rest}>
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
            rounded="label"
            data-card-image
          />

        </Flex>

        <Box flex="1">
          <Heading as="h3" size="md" title={name}>
            <CardLink to={orgPath({ id, slug })}>{name}</CardLink>
          </Heading>

          {status && status !== 'active' && (
            <Label tone="neutral">{orgStatusLabel(status)}</Label>
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
                    <option
                      key={value}
                      value={value}
                      disabled={takenRoles.includes(value)}
                    >
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
              Published {published_count}{' '}
              {published_count === 1 ? 'game' : 'games'}
            </Text>
          )}

          {/* What it is and where, in one line: the type replaces the badge
              that sat on the logo. */}
          <Text fontSize="sm" color="muted" lineClamp={1}>
            {[
              orgTypeLabel(type),
              location &&
                (location.city
                  ? `${location.city}, ${location.country_code}`
                  : countryNames[location.country_code.toUpperCase()]),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </Box>

        {onRemove && (
          <IconButton
            mx={5}
            size="xs"
            aria-label={`Remove ${name}`}
            rounded="full"
            variant="outline"
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
