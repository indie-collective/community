import { Link } from 'react-router';
import { useColorModeValue } from './ui/color-mode';
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

function GameCard({
  ref,
  id,
  images = [],
  igdb_game,
  name,
  tags,
  entities,
  onRemove,
  isCompact,
}) {
  const placeholder = usePlaceholder();

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

  if (isCompact) {
    return (
      <Link to={`/game/${id}`}>
        <Box
          rounded={5}
          transition="background-color 200ms ease-out"
          ref={ref}
          position="relative"
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
            backgroundColor={images.length > 0 ? {
              base: '#ffffffbb',
              _dark: '#00000088',
            } : ''}
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
    <Card
      isClickable
      ref={ref}
      padding={2}
      rounded={10}
      transition="background-color 200ms ease-out"
      cursor="pointer"
      _hover={{
        bg: { base: 'gray.200', _dark: 'gray.700' },
      }}
    >
      <AspectRatio ratio={2}>
        <Image
          size="100%"
          objectFit="cover"
          src={image ?? placeholder}
          srcSet={imageSrcSet}
          alt="Game cover"
          rounded="md"
        />
      </AspectRatio>
      <Box px={1} py={2}>
        <Heading as="h3" size="md" title={name}>
          <CardLink to={`/game/${id}`}>{name}</CardLink>
        </Heading>
      </Box>
      {tags?.length > 0 && <TagList tags={tags} ml="3px" />}
    </Card>
  );
}

export default GameCard;
