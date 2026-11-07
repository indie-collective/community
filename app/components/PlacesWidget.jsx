import { Box, Heading, Flex, Button } from '@chakra-ui/react';
import { LuChevronRight } from 'react-icons/lu';
import Link from './Link';
import { Overlay } from 'pigeon-maps';
import AtlasMark from './AtlasMark';
import TileMap from './TileMap';

/**
 * The homepage's atlas spread: the map in the brand's deep
 * green, a coral pin for every place, and the count over it.
 */
const PlacesWidget = ({ placesCount, placesPoints }) => (
  <Box
    position="relative"
    overflow="hidden"
    height={{ base: '240px', md: '300px' }}
    borderRadius="panel"
    borderWidth="2px"
    borderColor="ink"
    bg="#054f45"
  >
    <Box
      position="absolute"
      inset={0}
      // Only the tiles are tinted the brand's deep green: the pins stay coral.
      // As specific as TileMap's own tile filter, and later, so it wins; in
      // dark mode the tiles are already dark, so they're left as they are.
      css={{
        _light: {
          '& .pigeon-tiles-box img[src^="https://tile.openstreetmap.org/"]': {
            filter:
              'grayscale(1) sepia(1) hue-rotate(115deg) saturate(1.8) brightness(0.6)',
          },
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
        {placesPoints.map(([latitude, longitude, type], i) => (
          <Overlay key={i} anchor={[latitude, longitude]} offset={[6, 6]}>
            <AtlasMark type={type} size={12} />
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
      // Dark only under the text, in both colour modes.
      bgGradient="to-t"
      gradientFrom="rgba(5, 20, 18, 0.8)"
      gradientVia="rgba(5, 20, 18, 0.35)"
      gradientTo="transparent"
      css={{
        '--gradient-via-position': '30%',
        '--gradient-to-position': '60%',
      }}
      color="white"
    >
      <Box mt="auto">
        <Heading
          as="h3"
          fontSize={{ base: '4xl', md: '5xl' }}
          fontWeight="600"
          letterSpacing="-0.03em"
          lineHeight="1"
          fontVariantNumeric="tabular-nums"
        >
          {placesCount.toLocaleString('en')} places
        </Heading>
      </Box>
      <Button
        variant="solid"
        bg="white"
        color="onPop"
        borderRadius="control"
        fontWeight="semibold"
        _hover={{ bg: '#e8f1ee' }}
        transition="background-color 150ms ease-out"
        asChild
      >
        <Link to="/places">
          Open the atlas
          <LuChevronRight />
        </Link>
      </Button>
    </Flex>
  </Box>
);

export default PlacesWidget;
