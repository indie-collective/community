import Link from 'next/link';
import { Box, Image, Text } from '@chakra-ui/core';
import placeholder from '../public/placeholder.jpg';

const GameCard = ({ id, images, name }) => (
  <Box p={1} borderWidth="1px" flex="1" rounded="md">
    <Image
      src={
        images.length > 0
          ? `http://localhost:4000/images/thumb_${images[0].id}.jpg`
          : placeholder
      }
      objectFit="cover"
      minWidth="100%"
      rounded="md"
    />
    <Box p={2} pb={1} grid>
      <Text
        fontWeight="bold"
        textTransform="uppercase"
        fontSize="sm"
        letterSpacing="wide"
        color="teal.600"
      >
        Game
      </Text>
      <Link href={`/game/${id}`}>{name}</Link>
    </Box>
  </Box>
);

export default GameCard;
