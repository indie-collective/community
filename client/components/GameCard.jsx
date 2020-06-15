import { forwardRef } from 'react';
import Link from 'next/link';
import {
  Box,
  Image,
  PseudoBox,
  useColorMode,
  AspectRatioBox,
} from '@chakra-ui/core';

import usePlaceholder from '../hooks/usePlaceholder';

const GameCard = forwardRef(({ id, images, name, isCompact }, ref) => {
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
            _hover={{
              backgroundColor: colorMode === 'dark' ? 'gray.700' : 'gray.50',
              cursor: 'pointer',
            }}
           >
            {images.length > 0 && (
              <Image
                position="absolute"
                objectFit="cover"
                rounded="md"
                size="100%"
                src={images[0].thumbnail_url}
                alt="Game cover"
                rounded="md"
                zIndex={-1}
              />
            )}

            <PseudoBox
              rounded="md"
              paddingY={2}
              paddingX={5}
              zIndex={2}
              backgroundColor={images.length > 0 ? overlayBgColor : ''}
              fontWeight="bold"
            >
              {name}
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
              src={images.length > 0 && images[0].thumbnail_url}
              alt="Game cover"
              fallbackSrc={placeholder}
              rounded="md"
            />
          </AspectRatioBox>

          <Box padding={2}>
            {name}
          </Box>
        </PseudoBox>
      </a>
    </Link>
  );
});

export default GameCard;
