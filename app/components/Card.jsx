import React from 'react';
import { Box } from '@chakra-ui/react';

function Card({ ref, isClickable, ...rest }) {
  if (isClickable) {
    rest._focusWithin = {
      // TODO: theme
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    };
  }

  return (
    <Box
      ref={ref}
      position="relative"
      {...rest}
    />
  );
}

export default Card;
