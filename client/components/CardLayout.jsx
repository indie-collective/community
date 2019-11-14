import Link from 'next/link';
import { Box, Image, Text } from '@chakra-ui/core';

const CardLayout = ({ cards }) => (
  <Box p={4} display={{ md: 'grid', sm: 'flex' }} gridAutoColumns={3}>
    <Box mt={{ base: 4, md: 0 }} ml={{ md: 6 }}>
      <Text
        fontWeight="bold"
        textTransform="uppercase"
        fontSize="sm"
        letterSpacing="wide"
        color="teal.600"
      >
        Game
      </Text>
      <Link
        mt={1}
        display="block"
        fontSize="lg"
        lineHeight="normal"
        fontWeight="semibold"
        href="#"
      >
        {props.name}
      </Link>
    </Box>
  </Box>
);

export default GameCard;
