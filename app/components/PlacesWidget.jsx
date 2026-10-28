import { Box, Heading, Text, Flex, Button } from '@chakra-ui/react';
import { LuChevronRight } from 'react-icons/lu';
import Link from './Link';
import { Overlay } from 'pigeon-maps';
import TileMap from './TileMap';

/**
 * The homepage's atlas spread (magazine pass): the map in the brand's deep
 * green, a coral pin for every place, and the count over it.
 */
const PlacesWidget = ({ placesCount, placesPoints }) => (
  <Box
    position="relative"
    overflow="hidden"
    height={{ base: '240px', md: '300px' }}
    borderRadius="2xl"
    borderWidth="2px"
    borderColor="ink"
    bg="#054f45"
  >
    <Box
      position="absolute"
      inset={0}
      // Only the tiles are tinted the brand's deep green: the pins stay coral.
      css={{
        '& img': {
          filter:
            'grayscale(1) sepia(1) hue-rotate(115deg) saturate(1.8) brightness(0.6)',
        },
      }}
      pointerEvents="none"
      aria-hidden
    >
      <TileMap
        defaultCenter={[40, 0]}
        defaultZoom={3}
        touchEvents={false}
        mouseEvents={false}
      >
        {placesPoints.map((point, i) => (
          <Overlay key={i} anchor={point} offset={[5, 5]}>
            <Box
              w="10px"
              h="10px"
              bg="coral"
              borderRadius="full"
              border="2px solid #10201d"
            />
          </Overlay>
        ))}
      </TileMap>
    </Box>
    <Flex
      position="relative"
      zIndex={1}
      h="100%"
      direction={{ base: 'column', sm: 'row' }}
      justify="space-between"
      align={{ base: 'flex-start', sm: 'flex-end' }}
      gap={4}
      p={{ base: 5, md: 6 }}
      // Dark at the bottom, where the text sits, in both colour modes.
      bgGradient="to-t"
      gradientFrom="rgba(5, 20, 18, 0.85)"
      gradientTo="transparent"
      color="white"
    >
      <Box mt="auto">
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="wider"
          textTransform="uppercase"
          color="sun"
        >
          Where the scene meets
        </Text>
        <Heading
          as="h3"
          fontSize={{ base: '4xl', md: '5xl' }}
          fontWeight="800"
          letterSpacing="-0.03em"
          lineHeight="1"
          fontVariantNumeric="tabular-nums"
        >
          {placesCount.toLocaleString('en')} places
        </Heading>
      </Box>
      <Button
        variant="solid"
        bg="sun"
        color="onPop"
        borderWidth="2px"
        borderColor="onPop"
        fontWeight="semibold"
        _hover={{
          transform: 'translate(-2px, -2px)',
          shadow: '4px 4px 0 #10201d',
        }}
        transition="transform 120ms ease-out, box-shadow 120ms ease-out"
        asChild
      >
        <Link to="/places">
          Open the map
          <LuChevronRight />
        </Link>
      </Button>
    </Flex>
  </Box>
);

export default PlacesWidget;
