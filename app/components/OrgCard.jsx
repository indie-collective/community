import {
  Box,
  Image,
  Heading,
  IconButton,
  SkeletonText,
  Skeleton,
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
  <Box display="flex" alignItems="center" gap={2.5} p={1.5}>
    <Skeleton w="56px" aspectRatio={1} rounded="8px" flexShrink={0} />
    <SkeletonText noOfLines={2} gap={2} flex={1} />
  </Box>
);

/**
 * A studio or association, as a row: its logo in a small square, then its
 * name and what it is and where. Bare on the page; under the pointer it
 * lifts onto a card. The same row on every page. On a game, how it took part
 * (with `onInvolvementChange`, a select to change it); with `onRemove`, a
 * button in the corner takes it off the list it is on.
 */
const OrgCard = ({
  id,
  slug,
  type,
  status,
  logo,
  name,
  location,
  onRemove,
  // #40: how the organisation took part in a game, shown under its name;
  // with onInvolvementChange, a select to change it.
  involvement,
  onInvolvementChange,
  // Roles it already has on the game, not offered in the select (#335).
  takenRoles = [],
  // #331: on the publishers list, how many games it published.
  published_count,
  // Props that belong to records, not to the card's box.
  people, games, events,
  ...rest
}) => {
  const placeholder = usePlaceholder('square');
  const where =
    location &&
    (location.city
      ? `${location.city}, ${location.country_code}`
      : countryNames[location.country_code?.toUpperCase()]);

  return (
    <Card
      id={id}
      isClickable
      bg="transparent"
      rounded="card"
      p={1.5}
      display="flex"
      alignItems="center"
      gap={2.5}
      {...rest}
    >
      <Box
        w="56px"
        aspectRatio={1}
        flexShrink={0}
        rounded="8px"
        overflow="hidden"
        bg="surface"
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
      {onRemove && (
        // Above the card's link overlay, so it can be used.
        <IconButton
          position="absolute"
          top={1.5}
          right={1.5}
          zIndex={1}
          size="xs"
          rounded="full"
          variant="outline"
          aria-label={`Remove ${name}`}
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <LuTrash2 />
        </IconButton>
      )}

      {/* Clear of the remove button beside it. */}
      <Box minW={0} flex={1} pr={onRemove ? 8 : 1}>
        <Heading
          as="h3"
          size="sm"
          fontWeight="600"
          lineHeight="1.2"
          title={name}
          // The link clamps itself to two lines; here, one.
          css={{ '& a': { WebkitLineClamp: '1' } }}
        >
          <CardLink to={orgPath({ id, slug })}>{name}</CardLink>
        </Heading>

        {/* What it is and where, in one line. */}
        <Text fontSize="xs" color="muted" lineClamp={1}>
          {[orgTypeLabel(type), where].filter(Boolean).join(' · ')}
        </Text>

        {status && status !== 'active' && (
          <Label tone="neutral" mt={1}>
            {orgStatusLabel(status)}
          </Label>
        )}

        {published_count > 0 && (
          <Text fontSize="xs" color="muted">
            Published {published_count}{' '}
            {published_count === 1 ? 'game' : 'games'}
          </Text>
        )}

        {involvement &&
          (onInvolvementChange ? (
            // Above the card's link overlay, so it can be used.
            <NativeSelect.Root
              size="xs"
              maxW="9rem"
              mt={1.5}
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
            <Text fontSize="xs" color="muted">
              {gameRoleLabel(involvement)}
            </Text>
          ))}
      </Box>
    </Card>
  );
};

export default OrgCard;
