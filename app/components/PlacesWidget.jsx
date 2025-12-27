import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Link } from '@remix-run/react';
import { Map, Overlay } from 'pigeon-maps';

const PlacesWidget = ({ placesCount, placesPoints }) => {
  const bg = useColorModeValue('white', 'gray.900');
  const overlayBg = useColorModeValue('whiteAlpha.600', 'blackAlpha.600');

  return (
    <Box
      mb={5}
      background={bg}
      shadow="sm"
      borderRadius={7}
      position="relative"
      overflow="hidden"
      height="200px"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.4}
        pointerEvents="none"
      >
        <Map
          defaultCenter={[40, 0]}
          defaultZoom={3}
          touchEvents={false}
          mouseEvents={false}
        >
          {placesPoints.map((point, i) => (
            <Overlay key={i} anchor={point} offset={[3, 3]}>
              <Box w="6px" h="6px" bg="teal.500" borderRadius="full" />
            </Overlay>
          ))}
        </Map>
      </Box>
      <Flex
        justify="space-between"
        align="center"
        position="relative"
        zIndex={1}
        h="100%"
        bg={overlayBg}
        p={5}
      >
        <Box>
          <Heading as="h3" size="lg">
            Places
          </Heading>
          <Text fontSize="2xl" fontWeight="bold">
            {placesCount} locations
          </Text>
        </Box>
        <Button
          as={Link}
          to="/places"
          rightIcon={<ChevronRightIcon />}
          colorScheme="green"
          size="lg"
        >
          Explore Map
        </Button>
      </Flex>
    </Box>
  );
};

export default PlacesWidget;
