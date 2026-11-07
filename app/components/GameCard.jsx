import {
  Box,
  Image,
  AspectRatio,
  IconButton,
  Text,
  Heading,
  Skeleton,
} from '@chakra-ui/react';
import { LuTrash2 } from 'react-icons/lu';

import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';
import TagList from './TagList';
import { gamePath } from '../utils/slug';

export const GameCardSkeleton = () => (
  <Box bg="surface" rounded="card" shadow="raised" p={1.5}>
    <AspectRatio ratio={4 / 3}>
      <Skeleton rounded="8px" />
    </AspectRatio>
    <Box px={1.5} pt={2} pb={1.5} w="75%">
      <Skeleton>
        <Heading size="sm">Game Title</Heading>
      </Skeleton>
    </Box>
  </Box>
);

/**
 * A game's picture for cards and the homepage cover: its first IGDB
 * screenshot, else its first uploaded image.
 */
export function gameImage({ images = [], igdb_game }) {
  let image = images[0]?.thumbnail_url;
  let imageSrcSet = images[0]?.thumbnail_url;

  const imageFromIGDB = igdb_game?.screenshots[0]?.url;
  if (imageFromIGDB) {
    image = imageFromIGDB.replace(/t_thumb/, 't_cover_big');
    imageSrcSet = `${image}, ${imageFromIGDB.replace(
      /t_thumb/,
      't_cover_big_2x'
    )} 2x`;
  }
  return { image, imageSrcSet };
}

/**
 * A game, as a small collectible card: its picture in a window inset in
 * the card, then its name, studio and tags. The same card on every page;
 * the homepage sets it a little off-straight with `tilt` (degrees), and it
 * straightens under the pointer. With `onRemove`, a button in the
 * picture's corner takes it off the list it is on.
 */
function GameCard({
  ref,
  id,
  slug,
  images = [],
  igdb_game,
  name,
  tags,
  entities,
  onRemove,
  tilt = 0,
  // Off on a studio's own page, where the studio goes without saying.
  showStudio = true,
}) {
  const placeholder = usePlaceholder();
  const { image, imageSrcSet } = gameImage({ images, igdb_game });
  const studio = showStudio ? entities?.[0]?.name : undefined;

  return (
    <Card
      isClickable
      ref={ref}
      bg="surface"
      rounded="card"
      shadow="xs"
      p={1.5}
      transform={tilt ? `rotate(${tilt}deg)` : undefined}
      transition="transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 160ms ease-out"
      _hover={{
        shadow: 'raisedHover',
        transform: tilt ? 'rotate(0deg) scale(1.03)' : 'translateY(-2px)',
        zIndex: 1,
      }}
    >
      <AspectRatio ratio={4 / 3}>
        <Image
          src={image ?? placeholder}
          srcSet={imageSrcSet}
          alt=""
          objectFit="cover"
          rounded="8px"
          borderWidth="1px"
          borderColor="ink"
          data-card-image
        />
      </AspectRatio>
      {onRemove && (
        // Above the card's link overlay, so it can be used.
        <IconButton
          position="absolute"
          top={3}
          right={3}
          zIndex={1}
          size="xs"
          rounded="full"
          variant="outline"
          bg="surface"
          aria-label={`Remove ${name}`}
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <LuTrash2 />
        </IconButton>
      )}
      <Box px={1.5} pt={2} pb={1.5}>
        <Heading as="h3" size="sm" fontWeight="600" lineHeight="1.2" lineClamp={1} title={name}>
          <CardLink to={gamePath({ id, slug })}>{name}</CardLink>
        </Heading>
        {studio && (
          <Text fontSize="xs" color="muted" lineClamp={1}>
            {studio}
          </Text>
        )}
        {tags?.length > 0 && <TagList tags={tags} mt={2} />}
      </Box>
    </Card>
  );
}

export default GameCard;
