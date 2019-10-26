import React from 'react';
import { Box, Image, Flex, Text } from '@chakra-ui/core';

const layout = [
  '1 / 1 / 3 / 3',
  '1 / 3 / 2 / 4',
  '2 / 3 / 3 / 4',
  '3 / 1 / 4 / 2',
  '3 / 2 / 4 / 3',
  '3 / 3 / 4 / 4',
];

const CardGrid = ({ children }) => {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
      gridTemplateRows="repeat(3, 1fr)"
      gridColumnGap="10px"
      gridRowGap="10px"
      width="100%"
      height="500px"
    >
      {React.Children.map(children, (child, index) => (
        <Box gridArea={layout[index]}>
          {child}
        </Box>
      ))}
    </Box>
  );
};

export default CardGrid;
