import Link from './Link';
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
  <Box>
    <AspectRatio ratio={2}>
      <Skeleton />
    </AspectRatio>
    <Box py={2} w="75%">
      <Skeleton>
        <Heading size="md">Game Title</Heading>
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
  isCompact,
  // Magazine pass: 'cover' is the full-bleed cover with a floating label,
  // for the homepage; `tilt` (degrees) sets it a little off-straight, and
  // `featured` gives it the bigger label of the big slot.
  variant,
  tilt = 0,
  featured = false,
}) {
  const placeholder = usePlaceholder();
  const { image, imageSrcSet } = gameImage({ images, igdb_game });

  if (variant === 'cover') {
    const studio = entities?.[0]?.name;
    return (
      <Card
        isClickable
        ref={ref}
        h="100%"
        minH="150px"
        rounded="xl"
        overflow="hidden"
        borderWidth="2px"
        borderColor="ink"
        bg="surface"
        transform={`rotate(${tilt}deg)`}
        transition="transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)"
        _hover={{ transform: 'rotate(0deg) scale(1.03)', zIndex: 1 }}
      >
        <Image
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          src={image ?? placeholder}
          srcSet={imageSrcSet}
          alt=""
          data-card-image
        />
        <Box
          position="absolute"
          left={2.5}
          right={2.5}
          bottom={2.5}
          bg="surface"
          rounded="lg"
          px={3}
          py={2}
          shadow="lift"
        >
          <Heading
            as="h3"
            size={featured ? 'xl' : 'sm'}
            fontWeight={featured ? '800' : 'bold'}
            lineHeight="1.15"
            title={name}
          >
            <CardLink to={gamePath({ id, slug })}>{name}</CardLink>
          </Heading>
          {studio && (
            <Text
              fontSize="2xs"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
              color="muted"
              lineClamp={1}
            >
              {studio}
            </Text>
          )}
        </Box>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Link to={gamePath({ id, slug })}>
        <Box
          rounded={5}
          transition="background-color 200ms ease-out"
          ref={ref}
          position="relative"
          // Its own stacking context: the cover (zIndex -1) sits behind the
          // name, not behind the page (#203: covers didn't show).
          isolation="isolate"
          overflow="hidden"
          border="1px solid"
          borderColor={{ base: 'gray.100', _dark: 'gray.700' }}
          cursor="pointer"
        >
          {image && (
            <Image
              position="absolute"
              objectFit="cover"
              rounded="md"
              size="100%"
              src={image ?? placeholder}
              srcSet={imageSrcSet}
              alt=""
              zIndex={-1}
            />
          )}

          <Box
            display="flex"
            rounded="md"
            paddingY={2}
            paddingX={5}
            zIndex={2}
            backgroundColor={
              image
                ? {
                    base: '#ffffff99',
                    _dark: '#00000077',
                  }
                : ''
            }
            fontWeight="bold"
          >
            <Text>{name}</Text>

            {onRemove && (
              <IconButton
                m="auto"
                ml={2}
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
          </Box>
        </Box>
      </Link>
    );
  }

  return (
    <Card isClickable ref={ref} padding={2} rounded={10}>
      <AspectRatio ratio={2}>
        <Image
          size="100%"
          objectFit="cover"
          src={image ?? placeholder}
          srcSet={imageSrcSet}
          alt=""
          rounded="md"
          data-card-image
        />
      </AspectRatio>
      <Box px={1} py={2}>
        <Heading as="h3" size="md" title={name}>
          <CardLink to={gamePath({ id, slug })}>{name}</CardLink>
        </Heading>
      </Box>
      {tags?.length > 0 && <TagList tags={tags} ml="3px" />}
    </Card>
  );
}

export default GameCard;
