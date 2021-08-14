import { gql } from '@apollo/client';
import { forwardRef } from 'react';
import NextLink from 'next/link';
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
  ({ id, images, name, onRemove, isCompact }, ref) => {
    const placeholder = usePlaceholder();

    const bgColorHover = useColorModeValue('gray.100', 'gray.700');
    const overlayBgColor = useColorModeValue('#ffffffbb', '#00000088');

    if (isCompact) {
      return (
        <NextLink href={`/game/${id}`}>
          <a>
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
              {images.nodes.length > 0 && (
                <Image
                  position="absolute"
                  objectFit="cover"
                  rounded="md"
                  size="100%"
                  src={images.nodes[0].thumbnail_url}
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
                backgroundColor={images.nodes.length > 0 ? overlayBgColor : ''}
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
          </a>
        </NextLink>
      );
    }

    return (
      <Card
        isClickable
        ref={ref}
        _hover={{
          backgroundColor: bgColorHover,
          cursor: 'pointer',
        }}
        rounded={5}
      >
        <AspectRatio ratio={2}>
          <Image
            size="100%"
            objectFit="cover"
            src={images.nodes.length > 0 && images.nodes[0].thumbnail_url}
            alt="Game cover"
            fallbackSrc={placeholder}
            rounded="md"
          />
        </AspectRatio>

        <Box padding={2}>
          <Heading as="h3" size="md" isTruncated>
            <NextLink href={`/game/${id}`}>
              <CardLink href={`/game/${id}`}>{name}</CardLink>
            </NextLink>
          </Heading>
        </Box>
      </Card>
    );
  }
);

GameCard.fragments = {
  game: gql`
    fragment GameCardGame on Game {
      id
      name

      images {
        nodes {
          id
          thumbnail_url
        }
      }
    }
  `,
};

export default GameCard;
