import gql from 'graphql-tag';
import { forwardRef } from 'react';
import Link from 'next/link';
import {
  Box,
  Image,
  PseudoBox,
  useColorMode,
  AspectRatioBox,
  IconButton,
  Text,
} from '@chakra-ui/core';

import usePlaceholder from '../hooks/usePlaceholder';

const GameCard = forwardRef(
  ({ id, images, name, onRemove, isCompact }, ref) => {
    const { colorMode } = useColorMode();
    const placeholder = usePlaceholder();

    const bgColorHover = colorMode === 'dark' ? 'gray.700' : 'gray.50';

    if (isCompact) {
      const overlayBgColor = colorMode === 'dark' ? '#00000088' : '#ffffffbb';

      return (
        <Link href="/game/[id]" as={`/game/${id}`}>
          <a>
            <PseudoBox
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

              <PseudoBox
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
                    variantColor="red"
                    icon="delete"
                    onClick={(e) => {
                      e.preventDefault();

                      onRemove();
                    }}
                  />
                )}
              </PseudoBox>
            </PseudoBox>
          </a>
        </Link>
      );
    }

    return (
      <Link href="/game/[id]" as={`/game/${id}`}>
        <a>
          <PseudoBox
            ref={ref}
            boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
            _hover={{
              backgroundColor: bgColorHover,
              cursor: 'pointer',
            }}
            rounded={5}
          >
            <AspectRatioBox ratio={2}>
              <Image
                size="100%"
                objectFit="cover"
                src={images.nodes.length > 0 && images.nodes[0].thumbnail_url}
                alt="Game cover"
                fallbackSrc={placeholder}
                rounded="md"
              />
            </AspectRatioBox>

            <Box padding={2}>{name}</Box>
          </PseudoBox>
        </a>
      </Link>
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
