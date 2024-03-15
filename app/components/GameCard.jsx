import { Link } from '@remix-run/react';
import { forwardRef } from 'react';
import {
  Box,
  Image,
  AspectRatio,
  IconButton,
  Text,
  Heading,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import usePlaceholder from '../hooks/usePlaceholder';
import Card from './Card';
import CardLink from './CardLink';

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

const GameCard = forwardRef(
  ({ id, images = [], igdb_game, name, onRemove, isCompact }, ref) => {
    const placeholder = usePlaceholder();

    const bgColorHover = useColorModeValue('gray.100', 'gray.700');
    const overlayBgColor = useColorModeValue('#ffffffbb', '#00000088');

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
            borderColor={bgColorHover}
            _hover={{
              backgroundColor: bgColorHover,
              cursor: 'pointer',
            }}
          >
            {image && (
              <Image
                position="absolute"
                objectFit="cover"
                rounded="md"
                size="100%"
                src={image}
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
              backgroundColor={images.length > 0 ? overlayBgColor : ''}
              fontWeight="bold"
            >
              <Text>{name}</Text>

              {onRemove && (
                <IconButton
                  m="auto"
                  ml={2}
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
        _hover={{
          backgroundColor: bgColorHover,
          cursor: 'pointer',
        }}
      >
        <AspectRatio ratio={2}>
          <Image
            size="100%"
            objectFit="cover"
            src={image}
            srcSet={imageSrcSet}
            alt="Game cover"
            fallbackSrc={placeholder}
            rounded="md"
          />
        </AspectRatio>

        <Box padding={2}>
          <Heading as="h3" size="md" noOfLines={1} title={name}>
            <CardLink to={`/game/${id}`}>{name}</CardLink>
          </Heading>
        </Box>
      </Card>
    );
  }
);

export default GameCard;
