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
    const overlayBgColorHover =
      colorMode === 'dark' ? '#00000055' : '#ffffff99';

    return (
      <Link href="/game/[id]" as={`/game/${id}`}>
        <a>
          <Box
            ref={ref}
            boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
            borderWidth={1}
            rounded="md"
            position="relative"
            overflow="hidden"
          >
            {images.length > 0 && (
              <Image
                position="absolute"
                objectFit="cover"
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
              _hover={{
                cursor: 'pointer',
                backgroundColor:
                  images.length > 0 ? overlayBgColorHover : bgColorHover,
              }}
            >
              {name}
            </PseudoBox>
          </Box>
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
              roundedTop="md"
            />
          </AspectRatioBox>

          <Box borderWidth="1px" roundedBottom={5} padding={2}>
            {name}
          </Box>
        </PseudoBox>
      </a>
    </Link>
  );
});

export default GameCard;
