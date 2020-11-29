import React, { forwardRef } from 'react';
import { chakra } from '@chakra-ui/react';

const CardLink = forwardRef(function CardLink(props, ref) {
  return (
    <chakra.a
      ref={ref}
      position="static"
      _before={{
        content: "''",
        cursor: 'inherit',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      _focus={{
        outline: 'none',
      }}
      {...props}
    />
  );
});

export default CardLink;
